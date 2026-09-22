import { GeometryPoint, RecordId, Surreal } from "surrealdb";
import { AddressModel } from "./address";
import { CityModel } from "./city";
import {
    TABLE_ADDRESS,
    TABLE_VENUE,
    TABLE_VENUE_CATEGORY,
    TABLE_BOOKMARK,
    TABLE_ALREADY_BEEN,
} from "../constants";
import {
    ai,
    recordIdFromString,
    removeAccents,
    imageSharp,
    QueryResolver,
    type QueryResolverFilterArgs,
} from "../utils";

import * as s3 from "@rolle/s3";

import { placesApi, type BusinessDetailedInfo, type Weekday } from "@rolle/api_places";
import type {
    Venue,
    CreateVenue,
    CreateVenuePayload,
    VenueCategory,
    User,
    PaginationArgs,
    Paginated,
} from "@rolle/types";
import type { LatLng } from "@rolle/geo";

const S3_FOLDER = "venue";

export class VenueModel {
    static fullFetch = "address, address.city, address.state, address.country";

    static includeQueries: { [Key in keyof Venue]?: string } = {
        meta: "geo::distance($currentPos, $this.geo) AS meta.distance",
    };

    static normalize(payload: CreateVenuePayload): CreateVenue {
        return {
            ...payload,
            address: undefined,
            category: recordIdFromString(payload.category),
        };
    }

    static async getByUri(uri: string, geo: LatLng, db: Surreal) {
        const [result] = await db.query<[Venue[]]>(
            `
                SELECT *,
                geo::distance($currentPos, $this.geo) AS meta.distance
                FROM ${TABLE_VENUE} WHERE uri = $uri FETCH ${VenueModel.fullFetch};
            `,
            { uri, currentPos: new GeometryPoint([geo.longitude, geo.latitude]) },
        );
        if (result.length === 0) return undefined;
        return result[0];
    }

    static async getByGooglePlaceId(placeId: string, db: Surreal) {
        const [result] = await db.query<[Venue[]]>(
            `SELECT * FROM ${TABLE_VENUE} WHERE googlePlaceId = $placeId FETCH ${VenueModel.fullFetch};`,
            { placeId },
        );
        if (result.length === 0) return undefined;
        return result[0];
    }

    static async getOne<Include extends keyof typeof VenueModel.includeQueries = never>(
        args: { geo?: LatLng; filter?: QueryResolverFilterArgs<Venue>; include?: Include[] },
        db: Surreal,
    ): Promise<Venue | undefined> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const include = QueryResolver.include(VenueModel.includeQueries, args.include);
        const queryVars = { ...conditions };

        if (typeof args.geo !== "undefined") {
            queryVars.currentPos = new GeometryPoint([args.geo.longitude, args.geo.latitude]);
        }

        const [venue] = await db.query<[Venue]>(
            `
                SELECT *${include}
                FROM ONLY ${TABLE_VENUE}${whereClause}
                LIMIT 1
                FETCH ${VenueModel.fullFetch};
            `,
            queryVars,
        );

        return venue;
    }

    static async getMany(
        args: { geo: LatLng; pagination: PaginationArgs; filter?: QueryResolverFilterArgs<Venue> },
        db: Surreal,
    ): Promise<Paginated<Venue, { categories: VenueCategory["id"][] }>> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const [_, total, categories, result] = await db.query<
            [undefined, number, VenueCategory["id"][], Venue[]]
        >(
            `
                let $query = SELECT *,
                    geo::distance($currentPos, $this.geo) AS meta.distance
                    FROM ${TABLE_VENUE}${whereClause}
                    ORDER BY meta.distance ASC
                    FETCH ${VenueModel.fullFetch};

                count($query);
                array::distinct($query.*.category);
                array::slice($query, $start, $limit);
            `,
            {
                currentPos: new GeometryPoint([args.geo.longitude, args.geo.latitude]),
                start: (args.pagination.page - 1) * args.pagination.limit,
                limit: args.pagination.limit,
                ...conditions,
            },
        );

        return {
            meta: {
                total,
                categories,
                page: args.pagination.page,
                limit: args.pagination.limit,
            },
            data: result,
        };
    }

    static async getManyByCategory(category: Venue["category"], db: Surreal) {
        const [result] = await db.query<[Venue[]]>(
            `SELECT * FROM ${TABLE_VENUE} WHERE category=$category FETCH ${VenueModel.fullFetch};`,
            { category },
        );
        return result;
    }

    static async create(payload: CreateVenuePayload, db: Surreal): Promise<Venue> {
        const addressPayload = AddressModel.normalize(payload.address);
        const venuePayload = VenueModel.normalize(payload);

        const [venue] = await db.query<[Venue]>(
            `
            BEGIN TRANSACTION;
            let $address_id = CREATE ONLY ${TABLE_ADDRESS} CONTENT $addressPayload RETURN VALUE id;
            let $venue_id = CREATE ONLY ${TABLE_VENUE} CONTENT $venuePayload RETURN VALUE id;
            UPDATE $venue_id SET address = $address_id;
            RETURN SELECT * FROM ONLY type::thing($venue_id) FETCH ${VenueModel.fullFetch};
            COMMIT TRANSACTION;
            `,
            { addressPayload, venuePayload },
        );

        return venue;
    }

    static async createFromBusinessDetailedInfo(payload: BusinessDetailedInfo, db: Surreal) {
        const name = payload.name.trim();
        const uri = encodeURIComponent(`${payload.name} ${payload.placeId}`);

        let tempCategory = payload.type.toLowerCase();
        if (tempCategory.startsWith("loja de ")) {
            tempCategory = tempCategory.substring(7).trim();
        }
        if (tempCategory.startsWith("artigos de ")) {
            tempCategory = tempCategory.substring(10).trim();
        }

        const category = removeAccents(tempCategory.trim().split(" ")[0].toLowerCase());

        const [categoryId] = await db.query<[VenueCategory]>("UPSERT ONLY $category;", {
            category: new RecordId(TABLE_VENUE_CATEGORY, category),
        });

        const city = await CityModel.getByFullName(payload.city, db);
        const address = AddressModel.fromBusinessDetailedInfo(payload, city);

        let workingHours: Record<Weekday, { start: string; end: string }[]> | undefined;

        if (typeof payload.workingHours !== "undefined" && payload.workingHours !== null) {
            workingHours = Object.keys(payload.workingHours).reduce(
                (prev, key) => {
                    if (payload.workingHours![key as Weekday][0] === "Encerrado") {
                        return prev;
                    }

                    const v = payload.workingHours![key as Weekday].map((h) => {
                        const [start, end] = h.split("–");
                        return {
                            start: start || "",
                            end: end || "",
                        };
                    });

                    return {
                        ...prev,
                        [key]: v,
                    };
                },
                {} as Record<Weekday, { start: string; end: string }[]>,
            );
        }

        const imagesPromises = payload.photosSample
            .filter((image) => image.type === "photo")
            .map(async (image) => {
                try {
                    const [thumbUrlResponse, urlResponse] = await Promise.all([
                        fetch(image.photoUrl),
                        fetch(image.photoUrlLarge || image.photoUrl),
                    ]);

                    const [originalThumbUrlBuffer, originalUrlBuffer] = await Promise.all([
                        thumbUrlResponse.arrayBuffer(),
                        urlResponse.arrayBuffer(),
                    ]);

                    const [thumbUrlBuffer, urlBuffer] = await Promise.all([
                        imageSharp.compressImage(originalThumbUrlBuffer, {
                            size: imageSharp.twoByThree.small,
                        }),
                        imageSharp.compressImage(originalUrlBuffer, {
                            size: imageSharp.twoByThree.large,
                        }),
                    ]);

                    const [s3thumbUrl, s3url] = await Promise.all([
                        s3.uploadImage(
                            S3_FOLDER,
                            name,
                            thumbUrlBuffer,
                            thumbUrlResponse.headers.get("content-type")!,
                        ),
                        s3.uploadImage(
                            S3_FOLDER,
                            name,
                            urlBuffer,
                            urlResponse.headers.get("content-type")!,
                        ),
                    ]);

                    return {
                        thumbUrl: s3thumbUrl.url,
                        url: s3url.url,
                    };
                } catch (_) {
                    return {
                        thumbUrl: "",
                        url: "",
                    };
                }
            });

        let images: CreateVenuePayload["images"] = await Promise.all(imagesPromises);
        images = images.filter((img) => {
            return img.url !== "" && img.thumbUrl !== "";
        });

        const createVenuePayload: CreateVenuePayload = {
            uri,
            address,
            name,
            description: undefined,
            googlePlaceId: payload.placeId,
            geo: new GeometryPoint([payload.longitude, payload.latitude]),
            category: categoryId.id.toString(),
            phone: payload.phoneNumber ?? undefined,
            website: payload.website ?? undefined,
            workingHours: workingHours
                ? {
                      monday: workingHours["segunda-feira"],
                      tuesday: workingHours["terça-feira"],
                      wednesday: workingHours["quarta-feira"],
                      thursday: workingHours["quinta-feira"],
                      friday: workingHours["sexta-feira"],
                      saturday: workingHours["sábado"],
                      sunday: workingHours["domingo"],
                  }
                : undefined,
            socials: {
                instagram: payload.emailsAndContacts?.instagram ?? undefined,
                tiktok: payload.emailsAndContacts?.tiktok ?? undefined,
                x: payload.emailsAndContacts?.twitter ?? undefined,
            },
            cover: images.at(0) || {
                thumbUrl: "",
                url: "",
            },
            images,
        };

        const venue = await VenueModel.create(createVenuePayload, db);

        if (typeof venue.description === "undefined") {
            try {
                VenueModel.enhanceDescription(venue, db);
                VenueModel.enhanceHints(venue, db);
            } catch (error) {
                console.error(`${venue.name} description enhancement failed:`, error);
            }
        }

        return venue;
    }

    static async getOrCreateByGooglePlaceId(placeId: string, db: Surreal) {
        let venue = await VenueModel.getByGooglePlaceId(placeId, db);

        if (typeof venue === "undefined") {
            const placeDetails = await placesApi.details(placeId);
            if (placeDetails.length === 0) {
                return undefined;
            }
            venue = await VenueModel.createFromBusinessDetailedInfo(placeDetails[0], db);
        }

        return venue;
    }

    static async bookmarkBy(userId: User["id"], venueId: Venue["id"], db: Surreal) {
        try {
            await db.query(`RELATE $userId->${TABLE_BOOKMARK}->$venueId`, { userId, venueId });
            return true;
        } catch (_error) {
            await db.query(`DELETE $userId->${TABLE_BOOKMARK} WHERE out=$venueId`, {
                userId,
                venueId,
            });
            return false;
        }
    }

    static async isBookmarkedBy(userId: User["id"], venueId: Venue["id"], db: Surreal) {
        try {
            const [result] = await db.query(
                `RETURN array::len(SELECT id FROM ${TABLE_BOOKMARK} WHERE in=$userId AND out=$venueId LIMIT 1) > 0;`,
                { userId, venueId },
            );
            return result;
        } catch (_error) {
            return false;
        }
    }

    static async alreadyBeenBy(userId: User["id"], venueId: Venue["id"], db: Surreal) {
        try {
            await db.query(`RELATE $userId->${TABLE_ALREADY_BEEN}->$venueId`, { userId, venueId });
            return true;
        } catch (_error) {
            await db.query(`DELETE $userId->${TABLE_ALREADY_BEEN} WHERE out=$venueId`, {
                userId,
                venueId,
            });
            return false;
        }
    }

    static async enhanceDescription(venue: Venue, db: Surreal) {
        const placeDetails = await placesApi.details(venue.googlePlaceId!);
        const genDescription = await ai.generateVenueDescription(
            venue.name,
            venue.category.toString().split(":")[1],
            placeDetails[0]?.about || "",
        );

        await db.query("UPDATE ONLY $venueId SET description=$description;", {
            venueId: venue.id,
            description: genDescription,
        });
    }

    static async enhanceHints(venue: Venue, db: Surreal) {
        const placeReviews = await placesApi.reviews(venue.googlePlaceId!, 20);
        const genHints = await ai.generateVenueHints(placeReviews.map((r) => r.reviewText));
        await db.query("UPDATE ONLY $venueId SET hints=array::concat(hints, $hints);", {
            venueId: venue.id,
            hints: genHints,
        });
    }
}

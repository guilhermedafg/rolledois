import { GeometryPoint, Surreal } from "surrealdb";
import { QueryResolver, type QueryResolverFilterArgs, recordIdFromString } from "../utils";
import { TABLE_BOOKMARK, TABLE_LIST } from "../constants";

import type {
    AddCommentToListPayload,
    AddVenueToList,
    CreateList,
    List,
    Paginated,
    PaginationArgs,
    RemoveVenueFromList,
    UpdateList,
    User,
    Venue,
    ListFull,
    WithRequired,
} from "@rolle/types";
import type { LatLng } from "@rolle/geo";

export class ListModel {
    static ownerQuery = "(SELECT * OMIT email, password FROM ONLY $parent.owner) as owner";
    static venuesQuery =
        "(SELECT comment, record, geo::distance($currentPos, $this.record.geo) as distance FROM $parent.venues ORDER BY distance ASC) AS venues";

    /* Meta */
    static bookmarksCountQuery = `(SELECT count(<-${TABLE_BOOKMARK}<-user) FROM ONLY $parent.id).count as meta.bookmarksCount`;
    static totalVenuesQuery = "array::len(venues) as meta.totalVenues";
    static venuesCitiesQuery =
        "array::distinct(venues.*.record.address.city.fullName) as meta.venuesCities";
    static metaQueries = `
        ${ListModel.bookmarksCountQuery},
        ${ListModel.totalVenuesQuery},
        ${ListModel.venuesCitiesQuery}
    `;

    static includeQueries: { [Key in keyof List]?: string } = {
        owner: ListModel.ownerQuery,
        venues: ListModel.venuesQuery,
        meta: ListModel.metaQueries,
    };

    /* Fetch */
    static venueFetchQuery =
        "venues.*.record, venues.*.record.address, venues.*.record.address.city";

    static fetchQueries: { [Key in keyof List]?: string } = {
        venues: ListModel.venueFetchQuery,
    };

    static async getById(id: List["id"], db: Surreal): Promise<ListFull | undefined> {
        const [list] = await db.query<[ListFull]>(
            `
            SELECT *,
            ${ListModel.ownerQuery},
            ${ListModel.bookmarksCountQuery},
            ${ListModel.totalVenuesQuery},
            ${ListModel.venuesCitiesQuery}
            FROM ONLY $id FETCH ${ListModel.venueFetchQuery}
            `,
            { id },
        );
        return list;
    }

    static async getOne<
        Include extends keyof typeof ListModel.includeQueries = never,
        Fetch extends keyof typeof ListModel.fetchQueries = never,
    >(
        args: {
            filter: QueryResolverFilterArgs<List>;
            include?: Include[];
            fetch?: Fetch[];
        },
        db: Surreal,
    ): Promise<WithRequired<List, Include & Fetch> | undefined> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const include = QueryResolver.include(ListModel.includeQueries, args.include);
        const fetch = QueryResolver.fetch(ListModel.includeQueries, args.fetch);
        const [list] = await db.query<[WithRequired<List, Include & Fetch>]>(
            `SELECT *${include} FROM ONLY ${TABLE_LIST}${whereClause} LIMIT 1${fetch};`,
            {
                ...conditions,
            },
        );
        return list;
    }

    static async getByUri(
        uri: List["uri"],
        args: { geo: LatLng },
        db: Surreal,
    ): Promise<ListFull | undefined> {
        const [list] = await db.query<[ListFull]>(
            `
            SELECT *,
            (SELECT comment, record, geo::distance($currentPos, $this.record.geo) as distance FROM $parent.venues ORDER BY distance ASC) AS venues,
            ${ListModel.ownerQuery},
            ${ListModel.bookmarksCountQuery},
            ${ListModel.totalVenuesQuery},
            ${ListModel.venuesCitiesQuery}
            FROM ONLY ${TABLE_LIST} WHERE uri=$uri LIMIT 1 FETCH ${ListModel.venueFetchQuery};
            `,
            { uri, currentPos: new GeometryPoint([args.geo.longitude, args.geo.latitude]) },
        );

        return {
            ...list,
            venues: list.venues.map((v) => {
                return {
                    comment: v.comment,
                    record: {
                        ...v.record,
                        meta: {
                            distance: v.distance,
                        },
                    },
                };
            }),
        };
    }

    static async getMany(
        args: {
            pagination: PaginationArgs;
            filter?: QueryResolverFilterArgs<List>;
        },
        db: Surreal,
    ): Promise<Paginated<List>> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);

        const [total, lists] = await db.query<[number, List[]]>(
            `
            count(SELECT * FROM ${TABLE_LIST}${whereClause});
            SELECT *,
            ${ListModel.ownerQuery},
            ${ListModel.totalVenuesQuery},
            ${ListModel.venuesCitiesQuery}
            FROM ${TABLE_LIST}${whereClause}
            ORDER BY updatedAt DESC
            LIMIT $limit
            START $start;
            `,
            {
                start: (args.pagination.page - 1) * args.pagination.limit,
                limit: args.pagination.limit,
                ...conditions,
            },
        );

        return {
            meta: {
                total,
                page: args.pagination.page,
                limit: args.pagination.limit,
            },
            data: lists,
        };
    }

    static async getManyFromUserId(
        userId: User["id"],
        retrievePrivate: boolean,
        db: Surreal,
    ): Promise<Array<ListFull>> {
        const [lists] = await db.query<[ListFull[]]>(
            `
            SELECT *,
            ${ListModel.ownerQuery},
            ${ListModel.totalVenuesQuery},
            ${ListModel.venuesCitiesQuery}
            FROM ${TABLE_LIST}
            WHERE owner=$userId AND (private=false OR private=$private)
            ORDER BY updatedAt DESC
            FETCH ${ListModel.venueFetchQuery};
            `,
            { userId, private: retrievePrivate },
        );

        return lists;
    }

    static async getManyFromUserNickname(
        nickname: User["nickname"],
        retrievePrivate: boolean,
        db: Surreal,
    ): Promise<Array<List>> {
        const [lists] = await db.query<[List[]]>(
            `
            SELECT *,
            ${ListModel.ownerQuery},
            ${ListModel.totalVenuesQuery},
            ${ListModel.venuesCitiesQuery}
            FROM ${TABLE_LIST}
            WHERE owner.nickname=$nickname AND (private=false OR private=$private)
            ORDER BY updatedAt DESC;
            `,
            { nickname, private: retrievePrivate },
        );

        return lists;
    }

    static async getManyFromVenueId(id: Venue["id"], db: Surreal): Promise<Array<List>> {
        const [lists] = await db.query<[List[]]>(
            `
            SELECT *,
            ${ListModel.ownerQuery},
            ${ListModel.totalVenuesQuery},
            ${ListModel.venuesCitiesQuery}
            FROM ${TABLE_LIST}
            WHERE venues.*.record CONTAINS $id AND private = false;
            `,
            { id },
        );

        return lists;
    }

    static async create(payload: CreateList, db: Surreal): Promise<List> {
        const [list] = await db.query<[List]>(`CREATE ONLY ${TABLE_LIST} CONTENT $payload;`, {
            payload,
        });
        return list;
    }

    static async addVenue(payload: AddVenueToList, db: Surreal) {
        const [result] = await db.query<[List["id"]]>(
            "UPDATE ONLY $listId SET venues += $venue RETURN VALUE venue.id;",
            {
                listId: payload.listId,
                venue: {
                    record: payload.venueId,
                },
            },
        );
        const updatedList = await ListModel.getById(result, db);
        return updatedList!;
    }

    static async removeVenue(payload: RemoveVenueFromList, db: Surreal) {
        const [result] = await db.query<[List["id"]]>(
            "UPDATE ONLY $listId SET venues = venues[WHERE record!=$venueId] RETURN VALUE id;",
            {
                listId: payload.listId,
                venueId: payload.venueId,
            },
        );
        const updatedList = await ListModel.getById(result, db);
        return updatedList!;
    }

    static async comment(id: List["id"], payload: AddCommentToListPayload, db: Surreal) {
        const [result] = await db.query<[List["id"]]>(
            "UPDATE ONLY $listId SET venues[WHERE record==$venueId].comment = $comment RETURN VALUE id;",
            {
                listId: id,
                venueId: recordIdFromString(payload.venueId.toString()),
                comment: payload.comment,
            },
        );
        const updatedList = (await ListModel.getById(result, db))!;
        return updatedList;
    }

    static async bookmarkBy(userId: User["id"], listId: List["id"], db: Surreal) {
        try {
            await db.query(`RELATE $userId->${TABLE_BOOKMARK}->$listId;`, { userId, listId });
            return true;
        } catch (_error) {
            await db.query(`DELETE $userId->${TABLE_BOOKMARK} WHERE out=$listId;`, {
                userId,
                listId,
            });
            return false;
        }
    }

    static async updateOne(id: List["id"], payload: UpdateList, db: Surreal) {
        if (typeof payload.cover === "undefined") delete payload.cover;
        const [result] = await db.query<[List]>("UPDATE ONLY $id MERGE $payload;", { id, payload });
        return result;
    }

    static async deleteOne(id: List["id"], db: Surreal) {
        try {
            await db.query<[List]>("DELETE ONLY $id RETURN BEFORE;", { id });
            return true;
        } catch (_e) {
            return false;
        }
    }
}

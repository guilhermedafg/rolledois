import { Surreal } from "surrealdb";
import { hash } from "argon2";
import { QueryResolver, type QueryResolverFilterArgs, toNickname } from "@rolle/core";
import {
    TABLE_ALREADY_BEEN,
    TABLE_BOOKMARK,
    TABLE_FOLLOWS,
    TABLE_LIST,
    TABLE_USER,
} from "../constants";

import type {
    CreateUser,
    Paginated,
    PaginationArgs,
    Providers,
    UpdateUser,
    User,
    UserFull,
    WithRequired,
} from "@rolle/types";

export class UserModel {
    /**
     * User related queries
     */
    static followingQuery = `(->${TABLE_FOLLOWS}->user.{id, name, nickname, pictureUrl}) as following`;
    static followersQuery = `(<-${TABLE_FOLLOWS}<-user.{id, name, nickname, pictureUrl}) as followers`;

    /**
     * List/Venue queries
     */
    static alreadyBeenQuery = `(->${TABLE_ALREADY_BEEN}->venue.{id, googlePlaceId, createdAt}) as alreadyBeen`;
    static venueBookmarkQuery = `(->${TABLE_BOOKMARK}->venue.{id, googlePlaceId, createdAt}) as bookmarks.venues`;
    static listBookmarkQuery = `(->${TABLE_BOOKMARK}->list.{id, name, cover, owner.{id, name, uri, pictureUrl}}) as bookmarks.lists`;

    /**
     * Meta queries
     */
    static totalVenuesBookmarkedQuery = `count(->${TABLE_BOOKMARK}->venue) as meta.totalVenuesBookmarked`;
    static totalListsQuery = `count(SELECT id FROM ${TABLE_LIST} WHERE owner.id = $parent.id) as meta.totalLists`;
    static venuesCitiesQuery = `(SELECT $this as city, count() FROM (->${TABLE_BOOKMARK}->venue.address.city.fullName) GROUP BY city) as meta.venuesBookmarkedCities`;
    static venuesCategoriesQuery = `array::distinct((->${TABLE_BOOKMARK}->venue.category)) as meta.venuesBookmarkedCategories`;
    static isInstagramLinkedQuery = `(type::is::string($this.providers.instagramId)) as meta.isInstagramLinked`;

    static metaQueries = `
        ${UserModel.totalVenuesBookmarkedQuery},
        ${UserModel.totalListsQuery},
        ${UserModel.venuesCitiesQuery},
        ${UserModel.venuesCategoriesQuery},
        ${UserModel.isInstagramLinkedQuery}
    `;

    static allQueries = `
        ${UserModel.followingQuery},
        ${UserModel.followersQuery},
        ${UserModel.venueBookmarkQuery},
        ${UserModel.listBookmarkQuery},
        ${UserModel.alreadyBeenQuery},
        ${UserModel.metaQueries}
    `;

    static queries: { [Key in keyof User]?: string } = {
        followers: UserModel.followersQuery,
        following: UserModel.followingQuery,
        alreadyBeen: UserModel.alreadyBeenQuery,
        bookmarks: UserModel.venueBookmarkQuery + ", " + UserModel.listBookmarkQuery,
        meta: UserModel.metaQueries,
    };

    static sanitize(user: User): User {
        delete user.password;
        delete user.providers;
        return user;
    }

    static async create(payload: CreateUser, db: Surreal): Promise<UserFull> {
        if (typeof payload.password !== "undefined") {
            const passwordHash = await hash(payload.password);
            payload.password = passwordHash;
        }

        const [[result]] = await db.query<[User[]]>(`CREATE ${TABLE_USER} CONTENT $payload;`, {
            payload,
        });

        return (await UserModel.getById(result.id, db))!;
    }

    static async getById(id: User["id"], db: Surreal): Promise<UserFull | undefined> {
        const [result] = await db.query<[UserFull]>(
            `SELECT *, ${UserModel.allQueries} FROM ONLY type::thing($id);`,
            { id },
        );
        return result;
    }

    static async getOne<Include extends keyof User = never>(
        args: {
            filter: QueryResolverFilterArgs<User>;
            include?: Include[];
        },
        db: Surreal,
    ): Promise<WithRequired<User, Include> | undefined> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const include = QueryResolver.include(UserModel.queries, args.include);
        const [user] = await db.query<[WithRequired<User, Include>]>(
            `SELECT *${include} FROM ONLY ${TABLE_USER}${whereClause} LIMIT 1;`,
            {
                ...conditions,
            },
        );
        return user;
    }

    static async getByProvider(
        provider: Providers,
        id: string,
        db: Surreal,
    ): Promise<UserFull | undefined> {
        switch (provider) {
            case "google": {
                const [result] = await db.query<[UserFull[]]>(
                    `SELECT *, ${UserModel.allQueries} FROM ${TABLE_USER} WHERE $this.providers.googleId = $id;`,
                    { id },
                );
                if (result.length === 0) return undefined;
                return result[0];
            }
        }
    }

    static async getMany<Include extends keyof User>(
        args: {
            pagination: PaginationArgs;
            include?: Include[];
            filter?: QueryResolverFilterArgs<User>;
        },
        db: Surreal,
    ): Promise<Paginated<WithRequired<User, Include>>> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const include = QueryResolver.include(UserModel.queries, args.include);
        const [data] = await db.query<[Array<WithRequired<User, Include>>]>(
            `
                SELECT *${include}
                FROM ${TABLE_USER}${whereClause}
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
                limit: args.pagination.limit,
                page: args.pagination.page,
                total: 0,
            },
            data,
        };
    }

    static async follow(follower: User["id"], following: User["id"], db: Surreal) {
        await db.query(`RELATE $follower->${TABLE_FOLLOWS}->$following;`, { follower, following });
    }

    static async unfollow(follower: User["id"], following: User["id"], db: Surreal) {
        await db.query(`DELETE ${TABLE_FOLLOWS} WHERE in=$follower AND out=$following;`, {
            follower,
            following,
        });
    }

    static async updateOne(id: User["id"], payload: UpdateUser, db: Surreal) {
        if (typeof payload.pictureUrl === "undefined") delete payload.pictureUrl;
        if (typeof payload.nickname === "string") payload.nickname = toNickname(payload.nickname);
        if (typeof payload.birthdate === "string") payload.birthdate = new Date(payload.birthdate);
        if (typeof payload.password === "string") payload.password = await hash(payload.password);
        const [result] = await db.query<[User]>("UPDATE ONLY $id MERGE $payload;", {
            id,
            payload,
        });
        return result;
    }
}

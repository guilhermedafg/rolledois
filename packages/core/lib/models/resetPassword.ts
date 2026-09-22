import Surreal from "surrealdb";
import { TABLE_RESET_PASSWORD } from "../constants";

import { QueryResolver, type QueryResolverFilterArgs } from "../utils";
import type { ResetPassword } from "@rolle/types";

export class ResetPasswordModel {
    static async getOne(
        args: {
            filter: QueryResolverFilterArgs<ResetPassword>;
        },
        db: Surreal,
    ): Promise<ResetPassword | undefined> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const [result] = await db.query<[ResetPassword]>(
            `SELECT * FROM ONLY ${TABLE_RESET_PASSWORD}${whereClause} LIMIT 1;`,
            {
                ...conditions,
            },
        );
        return result;
    }

    static async getMany(
        args: {
            filter?: QueryResolverFilterArgs<ResetPassword>;
        },
        db: Surreal,
    ): Promise<Array<ResetPassword>> {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        const [result] = await db.query<[Array<ResetPassword>]>(
            `
                SELECT *
                FROM ${TABLE_RESET_PASSWORD}${whereClause};
            `,
            {
                ...conditions,
            },
        );

        return result;
    }

    static async create(payload: Omit<ResetPassword, "id">, db: Surreal) {
        await db.query<[ResetPassword]>(`CREATE ${TABLE_RESET_PASSWORD} CONTENT $payload;`, {
            payload,
        });
    }

    static async deleteById(id: ResetPassword["id"], db: Surreal) {
        await db.query(`DELETE ONLY ${id} RETURN BEFORE;`, { id });
    }

    static async delete(
        args: {
            filter: QueryResolverFilterArgs<ResetPassword>;
        },
        db: Surreal,
    ) {
        const { whereClause, conditions } = QueryResolver.where(args.filter);
        await db.query(`DELETE FROM ${TABLE_RESET_PASSWORD}${whereClause};`, { ...conditions });
    }
}

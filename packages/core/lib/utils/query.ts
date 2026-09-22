// import { RecordId } from "surrealdb";
import { RolleError } from "@rolle/error";

const OPS = [
    "@@",
    "~",
    "!~",
    "?~",
    "*~",
    "=",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "LIKE",
    "ILIKE",
    "IN",
    "CONTAINS",
] as const;
export type QueryWhereOperator = (typeof OPS)[number];

export type QueryResolverFilterArgs<T> = {
    [K in keyof T]?: [QueryWhereOperator, T[K] | Array<T[K]>];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Record<string, [QueryWhereOperator, any] | undefined>;

export class QueryResolver {
    static where<T>(args?: QueryResolverFilterArgs<T>) {
        const where: string[] = [];
        const conditions: Record<string, unknown> = {};
        let whereClause = "";

        if (typeof args !== "undefined" && Object.keys(args).length > 0) {
            Object.entries(args).forEach(([key, value]) => {
                if (typeof value === "undefined")
                    throw new Error(`Undefined filter value. Key ${key}`);
                const tempKey = key.split(".").at(-1)!;
                const [operator, condition] = value;
                if (!OPS.includes(operator)) throw new Error(`Unsupported operator: ${operator}`);
                conditions[tempKey] = condition;
                where.push(`${key} ${operator} $${tempKey}`);
            });
            whereClause += ` WHERE ${where.join(" AND ")}`;
        }

        return { whereClause, conditions };
    }

    static include<T>(queries: { [Key in keyof T]?: string }, include?: Array<keyof T>) {
        let query = "";
        if (typeof include === "undefined") return query;

        include.forEach((key) => {
            const temp = queries[key];
            if (typeof temp === "undefined") {
                throw new RolleError({
                    code: "Rolle.Server.Internal",
                    message: "Invalid include arguments.",
                });
            }
            query += ", " + temp;
        });

        return query;
    }

    static fetch<T>(queries: { [Key in keyof T]?: string }, fetch?: Array<keyof T>) {
        let query = "";
        if (typeof fetch === "undefined") return query;
        query = " FETCH ";

        fetch.forEach((key) => {
            const temp = queries[key];
            if (typeof temp === "undefined") {
                throw new RolleError({
                    code: "Rolle.Server.Internal",
                    message: "Invalid fetch arguments.",
                });
            }
            query += ", " + temp;
        });

        return query;
    }
}

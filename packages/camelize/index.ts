// Type-level helpers to transform snake_case keys to camelCase in types
type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<CamelCase<Tail>>}`
    : S;

type Camelize<T> =
    T extends Array<infer U>
        ? Camelize<U>[]
        : T extends object
          ? { [K in keyof T as CamelCase<Extract<K, string>>]: Camelize<T[K]> }
          : T;

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursevily converts object keys from `snake_case` to `camelCase`.
 * Accepts arrays.
 */
export function camelize<T>(input: T): Camelize<T> {
    if (Array.isArray(input)) {
        return input.map((item) => camelize(item)) as any;
    }

    if (input !== null && typeof input === "object") {
        const obj = input as Record<string, any>;
        const result: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            const camelKey = snakeToCamel(key);
            result[camelKey] = camelize(obj[key]);
        }
        return result as any;
    }

    // primitives (string, number, boolean, etc.) are returned as-is
    return input as any;
}

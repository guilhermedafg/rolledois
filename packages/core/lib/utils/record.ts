import { RecordId } from "surrealdb";

export function recordIdFromString<T extends string>(id: string) {
    const [table, identifier] = id.split(":");
    return new RecordId(<T>table, identifier);
}

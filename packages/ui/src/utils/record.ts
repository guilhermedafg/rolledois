import type { RecordId } from "surrealdb";

export function idFromRecordId(id: RecordId) {
    return id.toString().split(":")[1];
}

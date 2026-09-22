import Surreal from "surrealdb";
import { recordIdFromString, TABLE_EVENT, TABLE_VENUE } from "@rolle/core";

import lists from "../data/lists.json";

import type { CreateList } from "@rolle/types";

export async function seed(db: Surreal) {
    for (const { id, ...rest } of lists[0]) {
        const payload: CreateList = {
            ...rest,
            owner: recordIdFromString(rest.owner),
            venues: rest.venues.map((id) => ({
                record: recordIdFromString<typeof TABLE_VENUE>(id),
            })),
            events: rest.events.map(recordIdFromString<typeof TABLE_EVENT>),
        };
        await db.query("CREATE type::thing($id) CONTENT $payload", { id, payload });
    }
}

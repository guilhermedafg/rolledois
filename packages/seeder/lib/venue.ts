import Surreal, { GeometryPoint } from "surrealdb";
import { recordIdFromString } from "@rolle/core";

import venues from "../data/venues.json";
import type { CreateVenue } from "@rolle/types";

export async function seed(db: Surreal) {
    for (const { id, ...rest } of venues[0]) {
        const payload = {
            ...rest,
            geo: new GeometryPoint(rest.geo.coordinates as [number, number]),
            category: recordIdFromString(rest.category),
            address: recordIdFromString(rest.address),
        } satisfies CreateVenue;
        await db.query("CREATE type::thing($id) CONTENT $payload;", { id, payload });
    }
}

import Surreal, { RecordId } from "surrealdb";
import { recordIdFromString, TABLE_COUNTRY, TABLE_STATE } from "@rolle/core";

import states from "../data/states.json";
import countries from "../data/countries.json";
import cities from "../data/cities.json";
import addresses from "../data/addresses.json";

import type { CreateAddress, CreateCity } from "@rolle/types";

export async function seed(db: Surreal) {
    await seedCountries(db);
    await seedStates(db);
    await seedCities(db);
    // await seedAddresses(db);
}

async function seedCountries(db: Surreal) {
    const payload = countries.map((c) => ({ id: new RecordId(TABLE_COUNTRY, c.shortName), ...c }));
    await db.query(`INSERT INTO ${TABLE_COUNTRY} ($payload);`, { payload });
}

async function seedStates(db: Surreal) {
    const payload = states.map((s) => ({
        id: new RecordId(TABLE_STATE, s.shortName),
        ...s,
        country: new RecordId(TABLE_COUNTRY, s.country),
    }));
    await db.query(`INSERT INTO ${TABLE_STATE} ($payload);`, { payload });
}

async function seedCities(db: Surreal) {
    for (const { id, ...rest } of cities[0]) {
        const payload: CreateCity = {
            ...rest,
            state: recordIdFromString(rest.state),
            country: recordIdFromString(rest.country),
        };
        await db.query("CREATE type::thing($id) CONTENT $payload", { id, payload });
    }
}

async function _seedAddresses(db: Surreal) {
    for (const { id, ...rest } of addresses[0]) {
        const payload: CreateAddress = {
            ...rest,
            city: recordIdFromString(rest.city),
            state: recordIdFromString(rest.state),
            country: recordIdFromString(rest.country),
        };
        await db.query("CREATE type::thing($id) CONTENT $payload;", { id, payload });
    }
}

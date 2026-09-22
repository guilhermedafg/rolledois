import Surreal from "surrealdb";
import { TABLE_CITY } from "../constants";

import type { City } from "@rolle/types";

export class CityModel {
    static fullFetch = "state, country";

    static async getByFullName(fullName: string, db: Surreal) {
        const [[city]] = await db.query<[[Required<City>]]>(
            `SELECT * FROM ${TABLE_CITY} WHERE fullName = $fullName FETCH ${CityModel.fullFetch};`,
            { fullName },
        );
        return city;
    }
}

import Surreal, { RecordId } from "surrealdb";
import { recordIdFromString } from "../utils";
import { TABLE_ADDRESS, TABLE_CITY, TABLE_COUNTRY, TABLE_STATE } from "../constants";

import type { Address, City, CreateAddress, CreateAddressPayload } from "@rolle/types";
import type { BusinessDetailedInfo } from "@rolle/api_places";

export class AddressModel {
    static normalize(payload: CreateAddressPayload): CreateAddress {
        const city = recordIdFromString<typeof TABLE_CITY>(payload.city);
        const state = recordIdFromString<typeof TABLE_STATE>(payload.state);
        const country = recordIdFromString<typeof TABLE_COUNTRY>(payload.country);

        return {
            ...payload,
            city,
            state,
            country,
        };
    }

    static fromBusinessDetailedInfo(
        payload: BusinessDetailedInfo,
        city: Required<City>,
    ): CreateAddressPayload {
        const address = payload.fullAddress.slice(payload.name.length + 2).split(" - ")[0];
        const street = address.split(",").at(0)!.trim();
        const number = address.match(/\d+/)?.at(0)?.trim() ?? "S/N";
        const zipcode = payload.fullAddress
            .match(/\d{3,}-\d{3}/)![0]
            .replaceAll(/\D/g, "")
            .trim();

        return {
            city: city.id.toString(),
            state: city.state.id.toString(),
            country: city.country.id.toString(),
            street,
            number,
            zipcode,
            district: payload.district?.trim() ?? "",
        };
    }

    static async create(payload: CreateAddressPayload, db: Surreal): Promise<Address> {
        const [addressId] = await db.query<[RecordId]>(
            `CREATE ONLY ${TABLE_ADDRESS} CONTENT $payload RETURN VALUE id;`,
            {
                payload: AddressModel.normalize(payload),
            },
        );

        const [result] = await db.query<[Address]>(
            "SELECT * FROM ONLY type::thing($id) FETCH city, state, country;",
            {
                id: addressId,
            },
        );
        return result;
    }
}

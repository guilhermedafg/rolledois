import { isAxiosError } from "axios";
import { error } from "@sveltejs/kit";
import { rolleApi } from "@rolle/api";
import type { LatLng } from "@rolle/geo";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, cookies }) => {
    const geoInfoEncoded = cookies.get("geoInfo")!;
    const geo = JSON.parse(geoInfoEncoded) as LatLng;

    try {
        const [user] = await Promise.all([rolleApi.user.getByNickname(params.nickname)]);

        return {
            geo,
            user,
            initialState: [],
        };
    } catch (err) {
        if (!isAxiosError(err)) {
            error(500, "Internal Server Error.");
        }

        error(err.status!, "User not found.");
    }
};

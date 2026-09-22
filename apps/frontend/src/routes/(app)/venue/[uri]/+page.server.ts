import { redirect } from "@sveltejs/kit";
import { rolleApi } from "@rolle/api";
import type { PageServerLoad } from "./$types";
import type { LatLng } from "@rolle/geo";

export const load: PageServerLoad = async ({ params, cookies }) => {
    const geoInfoEncoded = cookies.get("geoInfo")!;
    const geo = JSON.parse(geoInfoEncoded) as LatLng;

    try {
        const [venue, lists] = await Promise.all([
            rolleApi.venue.getByUri(params.uri, geo),
            rolleApi.list.getManyByVenueUri(params.uri),
        ]);
        return { venue, lists, geo };
    } catch (_error) {
        // TODO: Deal with venue not found...
        throw redirect(308, "/");
    }
};

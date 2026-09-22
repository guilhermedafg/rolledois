import { rolleApi } from "@rolle/api";
import type { PageServerLoad } from "./$types";
import type { LatLng } from "@rolle/geo";

export const load: PageServerLoad = async ({ params, cookies }) => {
    const category = params.category;
    const geoInfoEncoded = cookies.get("geoInfo")!;
    const geo = JSON.parse(geoInfoEncoded) as LatLng;
    const [venues, lists] = await Promise.all([
        rolleApi.venue.getManyByCategory(category, { geo, pagination: { page: 1, limit: 10 } }),
        rolleApi.list.getManyByVenueCategory(category),
    ]);
    return { lists, venues, category, geo };
};

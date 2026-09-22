import { rolleApi } from "@rolle/api";

import type { PageServerLoad } from "./$types";
import type { LatLng } from "@rolle/geo";

export const prerender = false;
export const load: PageServerLoad = async ({ params, cookies }) => {
    const geoInfoEncoded = cookies.get("geoInfo")!;
    const geo = JSON.parse(geoInfoEncoded) as LatLng;
    const list = await rolleApi.list.getByUri(params.uri, geo);
    return { list };
};

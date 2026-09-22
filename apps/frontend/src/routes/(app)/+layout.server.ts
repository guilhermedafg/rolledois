import { ipLocationApi } from "@rolle/api";
import type { LatLng } from "@rolle/geo";
import type { LayoutServerLoad } from "./$types";
import type { Cookies } from "@sveltejs/kit";

function setGeoCookie(geoInfo: LatLng, cookies: Cookies) {
    cookies.set("geoInfo", JSON.stringify(geoInfo), { path: "/", httpOnly: false });
}

export const load: LayoutServerLoad = async ({ getClientAddress, cookies }) => {
    let geo = {
        longitude: -49.2908,
        latitude: -25.5026,
    } satisfies LatLng;

    const geoCookie = cookies.get("geoInfo");

    if (typeof geoCookie === "undefined") {
        setGeoCookie(geo, cookies);
    }

    // Geo info already on cookies...
    if (typeof geoCookie !== "undefined") {
        const parsedGeoCookie = JSON.parse(geoCookie) as LatLng;
        if (
            parsedGeoCookie.longitude !== geo.longitude &&
            parsedGeoCookie.latitude !== geo.latitude
        ) {
            return parsedGeoCookie;
        }
    }

    try {
        const clientIp = getClientAddress();
        const response = await ipLocationApi.getIpInfo(clientIp);

        if (!response.error) {
            geo = {
                longitude: response.longitude,
                latitude: response.latitude,
            };
            setGeoCookie(geo, cookies);
        }
        return geo;
    } catch (_) {
        return geo;
    }
};

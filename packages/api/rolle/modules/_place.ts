import type { AxiosInstance } from "axios";
import type { LatLng } from "@rolle/geo";
import type { BusinessInfo } from "../../../api_places";

export class Place {
    /**
     * Place base url.
     */
    static URL = "/place" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving nearby places filtered by text.
     */
    async search(query: string, latLng: LatLng) {
        const response = await this._axios.get<BusinessInfo[]>(`${Place.URL}/search`, {
            params: {
                query,
                lat: latLng.latitude,
                lng: latLng.longitude,
            },
        });

        return response.data;
    }
}

import type { AxiosInstance } from "axios";
import type { LatLng } from "@rolle/geo";
import type { SearchResponsePayload } from "../types";
import type { Paginated, List, User, Venue } from "@rolle/types";
import type { BusinessInfo } from "@rolle/api_places";

export class Search {
    /**
     * Search base url.
     */
    static URL = "/search" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving the search result bundled together.
     */
    async search(query: string, latLng: LatLng) {
        const response = await this._axios.get<SearchResponsePayload>(`${Search.URL}`, {
            params: {
                query,
                lat: latLng.latitude,
                lng: latLng.longitude,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving search results for places.
     */
    async places(query: string, geo: LatLng) {
        const response = await this._axios.get<BusinessInfo[]>(`${Search.URL}/p`, {
            params: {
                query,
                lat: geo.latitude,
                lng: geo.longitude,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving search results for venues.
     */
    async venues(query: string, geo: LatLng) {
        const response = await this._axios.get<Paginated<Venue>>(`${Search.URL}/v`, {
            params: {
                query,
                lat: geo.latitude,
                lng: geo.longitude,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving search results for users.
     */
    async users(query: string) {
        const response = await this._axios.get<User[]>(`${Search.URL}/u`, {
            params: { query },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving search results for lists.
     */
    async lists(query: string) {
        const response = await this._axios.get<Paginated<List>>(`${Search.URL}/l`, {
            params: { query },
        });
        return response.data;
    }
}

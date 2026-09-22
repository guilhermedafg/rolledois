import type { AxiosInstance } from "axios";
import type { Paginated, PaginationArgs, Venue as VenueType } from "@rolle/types";
import type { LatLng } from "@rolle/geo";

export class Venue {
    /**
     * Venue base url.
     */
    static URL = "/venue" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving many venues.
     */
    async getMany(page: number, limit: number, geo: LatLng) {
        const response = await this._axios.get<Paginated<VenueType>>(`${Venue.URL}`, {
            params: {
                page,
                limit,
                latitude: geo.latitude,
                longitude: geo.longitude,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a venue by its uri.
     */
    async getByUri(uri: string, geo: LatLng) {
        const response = await this._axios.get<VenueType>(`${Venue.URL}/${uri}`, {
            params: {
                latitude: geo.latitude,
                longitude: geo.longitude,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a venue by its google place id. If the venue does not
     * exist on the database, it will be created before returning.
     */
    async getByGooglePlaceId(placeId: string) {
        const response = await this._axios.get<VenueType>(`${Venue.URL}/google/${placeId}`);
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a list of venues by its category.
     */
    async getManyByCategory(category: string, opts: { geo: LatLng; pagination: PaginationArgs }) {
        const response = await this._axios.get<Paginated<VenueType>>(`${Venue.URL}/c/${category}`, {
            params: {
                page: opts.pagination.page,
                limit: opts.pagination.limit,
                latitude: opts.geo.latitude,
                longitude: opts.geo.longitude,
            },
        });
        return response.data;
    }
}

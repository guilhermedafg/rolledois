import axios, { type AxiosInstance } from "axios";
import { camelize } from "@rolle/camelize";

import type { LatLng } from "@rolle/geo";
import type { BusinessDetailedInfo, BusinessInfo, BusinessReview } from "./types";

const language = "pt";
const region = "pt";

/**
 * Responsible for managing connectivity with Local Bussiness Api.
 */
class Api {
    /**
     * Singleton instance.
     */
    private static instance: Api;

    /**
     * Creates or returns singleton instance.
     */
    static getInstance(): Api {
        if (!this.instance) {
            this.instance = new Api();
        }

        return this.instance;
    }

    /**
     * Returns base url for this api requests depending on
     * the environment that it is being executed.
     */
    static getBaseUrl() {
        return "https://local-business-data.p.rapidapi.com";
    }

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;
    get axios(): AxiosInstance {
        return this._axios;
    }

    /**
     * Create and configure axios instance.
     */
    constructor() {
        if (typeof window !== "undefined") {
            throw new Error("This API should not be used in the frontend.");
        }

        if (typeof process.env.LOCAL_BUSINESS_API_KEY === "undefined") {
            throw new Error("`LOCAL_BUSINESS_API_KEY` should be set as an environment variable.");
        }

        this._axios = axios.create({
            baseURL: Api.getBaseUrl(),
            withCredentials: true,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/json",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "x-rapidapi-key": process.env.LOCAL_BUSINESS_API_KEY,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "x-rapidapi-host": "local-business-data.p.rapidapi.com",
            },
        });
    }

    async search(query: string) {
        const response = await this._axios.get("/search", {
            params: {
                query,
                limit: 3,
                // Default is 13.
                zoom: 13,
                language,
                region,
            },
        });

        return camelize(response.data.data) as BusinessInfo[];
    }

    async searchNearby(query: string, latLng: LatLng) {
        const response = await this._axios.get("/search-nearby", {
            params: {
                query,
                lat: latLng.latitude,
                lng: latLng.longitude,
                limit: 3,
                // Default is 13.
                zoom: 13,
                language,
                region,
            },
        });

        return camelize(response.data.data) as BusinessInfo[];
    }

    async details(placeId: string) {
        const response = await this._axios.get("/business-details", {
            params: {
                business_id: placeId,
                extract_emails_and_contacts: "true",
                extract_share_link: "true",
                language,
                region,
            },
        });

        return camelize(response.data.data) as BusinessDetailedInfo[];
    }

    async reviews(placeId: string, limit = 5) {
        const response = await this._axios.get("/business-reviews", {
            params: {
                business_id: placeId,
                limit,
                language,
                region,
            },
        });

        return camelize(response.data.data) as BusinessReview[];
    }
}

/**
 * Class singleton instance.
 */
export const placesApi = Api.getInstance();

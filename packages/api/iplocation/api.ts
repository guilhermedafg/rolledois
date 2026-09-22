import axios, { type AxiosInstance } from "axios";
import type { IpLocationResponse } from "./types";

/**
 * Responsible for managing connectivity with Ip Api.
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
        this._axios = axios.create({
            baseURL: "https://ipapi.com",
            withCredentials: true,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/json",
            },
        });

        this._axios.interceptors.response.use((config) => {
            const data = Object.fromEntries(
                Object.entries(config.data).map(([key, value]) => [
                    key.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase()),
                    value,
                ]),
            );

            return {
                ...config,
                data,
            };
        });
    }

    async getIpInfo(ip: string) {
        const response = await this._axios.get<IpLocationResponse>(`${ip}/json`);
        return response.data;
    }
}

/**
 * Class singleton instance.
 */
export const ipLocationApi = Api.getInstance();

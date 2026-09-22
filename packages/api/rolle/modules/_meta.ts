import type { AxiosInstance } from "axios";

export class Meta {
    /**
     * Meta base url.
     */
    static URL = "/meta" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving user code.
     */
    async code() {
        const response = await this._axios.get<{ code: number; expiration: number }>(
            `${Meta.URL}/code`,
        );
        return response.data;
    }

    /**
     * GET HTTP request for generate linking code.
     */
    async generateCode() {
        const response = await this._axios.get<{ code: number; expiration: number }>(
            `${Meta.URL}/gen-code`,
        );
        return response.data;
    }
}

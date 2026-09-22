import type { AxiosInstance } from "axios";
import type { UserFull } from "@rolle/types";

export class Profile {
    /**
     * Profile base url.
     */
    static URL = "/profile" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving the logged user.
     */
    async me() {
        const response = await this._axios.get<UserFull>(`${Profile.URL}/me`);
        return response.data;
    }
}

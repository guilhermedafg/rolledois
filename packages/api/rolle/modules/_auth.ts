import { rolleApi } from "../api";

import type { AxiosInstance } from "axios";
import type {
    SignInRequestPayload,
    AuthResponsePayload,
    RefreshTokenResponsePayload,
    GoogleAuthUrlResponsePayload,
    GoogleSignRequestPayload,
} from "../types";
import type { CreateUserPayload } from "@rolle/types";

export class Auth {
    /**
     * Auth base url.
     */
    static URL = "/auth" as const;

    /**
     * Refresh token url.
     */
    static REFRESH_TOKEN_URL = `${Auth.URL}/refreshToken` as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * POST HTTP request for signing in.
     */
    async signIn(payload: SignInRequestPayload) {
        const response = await this._axios.post<AuthResponsePayload>(`${Auth.URL}/signin`, payload);
        rolleApi.authToken = response.data.accessToken;
        return response.data;
    }

    /**
     * POST HTTP request for signing up a new user account.
     */
    async signUp(payload: CreateUserPayload) {
        const response = await this._axios.post<AuthResponsePayload>(`${Auth.URL}/signup`, payload);
        rolleApi.authToken = response.data.accessToken;
        return response.data;
    }

    /**
     * GET HTTP request for generating a google auth url.
     */
    async googleAuthUrl() {
        const response = await this._axios.get<GoogleAuthUrlResponsePayload>(
            `${Auth.URL}/google/generate-auth-url`,
        );
        return response.data;
    }

    /**
     * POST HTTP request for signing up a new user account.
     */
    async googleSign(payload: GoogleSignRequestPayload) {
        const response = await this._axios.post<AuthResponsePayload>(`${Auth.URL}/google`, payload);
        rolleApi.authToken = response.data.accessToken;
        return response.data;
    }

    /**
     * GET HTTP request for refreshing authentication token.
     */
    async refreshToken() {
        const response = await this._axios.get<RefreshTokenResponsePayload>(Auth.REFRESH_TOKEN_URL);

        /**
         * Delays the response for a split second just to
         * make sure the interceptors doesn't make any
         * unecessary requests to the server.
         */
        await new Promise((res) => setTimeout(res, 250));
        rolleApi.authToken = response.data.accessToken;
        return response.data;
    }

    /**
     * GET HTTP request for signing out.
     */
    async signOut() {
        const response = await this._axios.get<boolean>(`${Auth.URL}/signout`);
        rolleApi.authToken = undefined;
        return response.data;
    }

    /**
     * POST HTTP request for forgotten password.
     */
    async forgotPassword(email: string) {
        const response = await this._axios.post<boolean>(`${Auth.URL}/forgot-password`, { email });
        return response.data;
    }

    /**
     * POST HTTP request for reseting password.
     */
    async resetPassword(payload: { password: string; token: string }) {
        const response = await this._axios.post<boolean>(`${Auth.URL}/reset-password`, payload);
        return response.data;
    }

    /**
     * POST HTTP request for checking if an email exists on the system.
     */
    async checkEmailType(email: string) {
        const response = await this._axios.post<{ type: "credential" | "social" }>(
            `${Auth.URL}/check-email`,
            {
                email,
            },
        );
        return response.data;
    }

    /**
     * POST HTTP request for checking if a nickname exists on the system.
     * @returns `true` if the nickname is already taken.
     */
    async checkNickname(nickname: string) {
        const response = await this._axios.post<boolean>(`${Auth.URL}/check-nickname`, {
            nickname,
        });
        return response.data;
    }
}

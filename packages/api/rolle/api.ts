import axios, { isAxiosError, type AxiosInstance } from "axios";
import { Auth, Profile, Venue, Place, User, List, Search, Meta } from "./modules";
import { RolleError } from "@rolle/error";

/**
 * Auth token local storage key.
 */
const LOCAL_STORAGE_AUTH_TOKEN_KEY = "rolle-token";

/**
 * Responsible for managing connectivity with Rolle Api.
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
    static getBaseUrl(): string {
        if (typeof window === "undefined") return "http://backend:3000";
        if (process.env.NODE_ENV === "development") return "http://localhost:3000";
        return "https://api.rolle.com.br";
    }

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;
    get axios(): AxiosInstance {
        return this._axios;
    }

    /**
     * Holds authentication token.
     */
    private _authToken: string | undefined;

    /**
     * Setter for authentication token.
     */
    set authToken(token: string | undefined) {
        this._authToken = token;

        if (typeof window === "undefined") return;

        if (typeof token === "undefined") {
            localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
            return;
        }

        localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, token);
    }

    get hasAuthToken() {
        return typeof this._authToken === "string";
    }

    /**
     * Whenever this is true all subsequent requests are put inside the queue.
     */
    private _refreshing = false;

    /**
     * Holds requests while authentication token is being refreshed.
     */
    private _requestQueue: Array<{ resolve: (value: unknown) => void }> = [];

    /**
     * Callback whenever the refresh token attempt fails.
     */
    public handleRefreshTokenExpired: (() => any) | undefined;

    /**
     * Authentication module.
     */
    private _auth!: Auth;
    get auth(): Auth {
        if (!this._auth) {
            this._auth = new Auth(this._axios);
        }

        return this._auth;
    }

    /**
     * Userentication module.
     */
    private _user!: User;
    get user(): User {
        if (!this._user) {
            this._user = new User(this._axios);
        }

        return this._user;
    }

    /**
     * Profile module.
     */
    private _profile!: Profile;
    get profile(): Profile {
        if (!this._profile) {
            this._profile = new Profile(this._axios);
        }

        return this._profile;
    }

    /**
     * Venue module.
     */
    private _venue!: Venue;
    get venue(): Venue {
        if (!this._venue) {
            this._venue = new Venue(this._axios);
        }

        return this._venue;
    }

    /**
     * Place module.
     */
    private _place!: Place;
    get place(): Place {
        if (!this._place) {
            this._place = new Place(this._axios);
        }

        return this._place;
    }

    /**
     * List module.
     */
    private _list!: List;
    get list(): List {
        if (!this._list) {
            this._list = new List(this._axios);
        }

        return this._list;
    }

    /**
     * Search module.
     */
    private _search!: Search;
    get search(): Search {
        if (!this._search) {
            this._search = new Search(this._axios);
        }

        return this._search;
    }

    /**
     * Meta module.
     */
    private _meta!: Meta;
    get meta(): Meta {
        if (!this._meta) {
            this._meta = new Meta(this._axios);
        }

        return this._meta;
    }

    /**
     * Create and configure axios instance.
     */
    constructor() {
        this._axios = axios.create({
            baseURL: Api.getBaseUrl(),
            withCredentials: true,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/json",
            },
        });

        this._hydrateAuthToken();
        this._configureRequestInterceptor(this._axios);
        this._configureResponseInterceptor(this._axios);
    }

    /**
     * Hydrate token value from `localStorage`.
     */
    private _hydrateAuthToken() {
        if (typeof window === "undefined") return;

        const localStorageToken = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);

        if (typeof localStorageToken === "string" && localStorageToken.length > 0) {
            this._authToken = localStorageToken;
        }
    }

    /**
     * Process failed requests queue.
     */
    private _processQueue() {
        for (const promise of this._requestQueue) {
            promise.resolve(undefined);
        }

        this._requestQueue = [];
    }

    /**
     * Configure axios request interceptor.
     */
    private _configureRequestInterceptor(axios: AxiosInstance): void {
        axios.interceptors.request.use(
            (config) => {
                if (config.headers && typeof this._authToken === "string") {
                    config.headers.set("Authorization", this._authToken);
                }

                return config;
            },
            (error) => Promise.reject(error),
        );
    }

    /**
     * Configure axios response interceptor.
     */
    private _configureResponseInterceptor(axios: AxiosInstance): void {
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Type guard.
                if (!isAxiosError(error)) return Promise.reject(error);

                if (typeof error.config === "undefined") return Promise.reject(error);
                if (typeof error.response === "undefined") return Promise.reject(error);

                const responseStatusCode = error.response.status;
                const originalRequest = error.config;

                // Not an authorization error...
                if (responseStatusCode !== 403) {
                    if (
                        typeof error.response.data.code === "string" &&
                        error.response.data.code.startsWith("Rolle.")
                    ) {
                        throw new RolleError({
                            ...error.response.data,
                        });
                    }

                    return Promise.reject(error);
                }

                // Refresh token expired...
                if (responseStatusCode === 403 && originalRequest.url === Auth.REFRESH_TOKEN_URL) {
                    this.authToken = undefined;
                    this._refreshing = false;
                    this._requestQueue = [];

                    if (typeof this.handleRefreshTokenExpired === "function") {
                        await this.handleRefreshTokenExpired();
                    }

                    return Promise.reject("Session expired.");
                }

                /**
                 * Tries to refresh authentication token and if successfully
                 * retries the original request.
                 */
                if (!this._refreshing) {
                    this._refreshing = true;
                    await this.auth.refreshToken();
                    this._processQueue();
                    this._refreshing = false;
                    return await this._axios(originalRequest);
                }

                return new Promise((resolve) => {
                    this._requestQueue.push({ resolve });
                }).then(() => this._axios(originalRequest));
            },
        );
    }
}

/**
 * Class singleton instance.
 */
export const rolleApi = Api.getInstance();

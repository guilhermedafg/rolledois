import { createClient, type RedisClientType } from "redis";

/**
 * Responsible for managing connectivity with redis Api.
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
    private _client: RedisClientType;
    get client(): RedisClientType {
        return this._client;
    }

    /**
     * Create and configure axios instance.
     */
    constructor() {
        this._client = createClient({ url: "redis://redis:6379" });
        this._client.on("connect", () => console.log("Redis Client connecting..."));
        this._client.on("ready", () => console.log("Redis Client connected."));
        this._client.on("error", (error) => console.error("Redis Client Error:", error));
    }
}

/**
 * Class singleton instance.
 */
export const redisApi = Api.getInstance();

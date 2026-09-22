import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";

import type { JWTPayload } from "hono/utils/jwt/types";

/**
 * Signs a new token.
 */
export async function generateToken(payload: JWTPayload) {
    if (typeof process.env.JWT_SECRET === "undefined") {
        throw new HTTPException(500, { message: "JWT Secret not found in .env file." });
    }

    return await sign(payload, process.env.JWT_SECRET);
}

/**
 * Get payload from tokens that starts with the `Bearer` affix.
 */
export async function getBearerTokenPayload(token: string) {
    if (typeof process.env.JWT_SECRET === "undefined") {
        throw new HTTPException(500, { message: "JWT Secret not found in .env file." });
    }

    return await verify(token.substring(7), process.env.JWT_SECRET, { alg: "HS256" });
}

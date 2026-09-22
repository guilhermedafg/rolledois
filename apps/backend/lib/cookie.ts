import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import type { Context } from "hono";

export async function setSecureCookie(c: Context, name: string, payload: string) {
    if (typeof process.env.COOKIE_SECRET === "undefined") {
        throw new HTTPException(500, { message: "Cookie Secret not found in .env file." });
    }

    await setSignedCookie(c, name, payload, process.env.COOKIE_SECRET, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
    });
}

export async function getSecureCookie(c: Context, name: string) {
    if (typeof process.env.COOKIE_SECRET === "undefined") {
        throw new HTTPException(500, { message: "Cookie Secret not found in .env file." });
    }

    return await getSignedCookie(c, process.env.COOKIE_SECRET, name);
}

export function deleteSecureCookie(c: Context, name: string) {
    return deleteCookie(c, name);
}

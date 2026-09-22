import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { JwtTokenExpired } from "hono/utils/jwt/types";

import { UserModel, recordIdFromString } from "@rolle/core";
import { getBearerTokenPayload } from "$lib";
import { getDb } from "src/database";

export const jwtAuth = createMiddleware(async (c, next) => {
    const jwt = c.req.header("Authorization");

    if (typeof jwt === "undefined") {
        throw new HTTPException(403, { message: "Authorization token missing." });
    }

    try {
        const payload = await getBearerTokenPayload(jwt);
        const userId = <string>payload.sub;
        const db = await getDb();
        const user = await UserModel.getById(recordIdFromString(userId), db);
        c.set("user", user);
        await next();
    } catch (error) {
        if (error instanceof JwtTokenExpired) {
            throw new HTTPException(403, { message: "JWT Token expired." });
        }

        throw new HTTPException(403, { message: "Authorization token invalid." });
    }
});

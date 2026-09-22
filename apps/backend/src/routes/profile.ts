import { Hono } from "hono";

import { UserModel } from "@rolle/core";
import { jwtAuth } from "src/middlewares";
import { HTTPException } from "hono/http-exception";

const router = new Hono<HonoRolle>();

router.use(jwtAuth);

router.get("/me", (c) => {
    const user = c.get("user");

    if (typeof user === "undefined") {
        throw new HTTPException(401, { message: "Client not signed in." });
    }

    return c.json(UserModel.sanitize(user));
});

export default router;

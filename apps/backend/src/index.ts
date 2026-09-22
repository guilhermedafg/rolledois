import "dotenv/config";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
// import { csrf } from "hono/csrf";
// import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";

import { RolleError } from "@rolle/error";
import { seed } from "@rolle/seeder";

import { logger as rolleLogger } from "$lib";
import { getDb, handleDbMigration, initDb } from "./database";
import { routes } from "./routes";
import { redisApi } from "@rolle/api_redis";

const app = new Hono<HonoRolle>();

await handleDbMigration();
await initDb();

/**
 * Init redis client connection.
 */
redisApi.client.connect();

try {
    const db = await getDb();
    await seed(db);
    rolleLogger.info("Database seed successfully ran.");
} catch (_) {
    rolleLogger.warn("Database seed did not go through.");
}

// app.use(secureHeaders());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://frontend:5173",
            "http://localhost:4173",
            "http://frontend:4173",
            "http://rolle.com.br",
            "http://www.rolle.com.br",
            "http://api.rolle.com.br",
            "https://rolle.com.br",
            "https://www.rolle.com.br",
            "https://api.rolle.com.br",
        ],
        credentials: true,
    }),
);
// app.use(csrf({ origin: ["http://localhost:3000"] }));
app.use(logger());

// Configures all routes.
for (const [k, v] of Object.entries(routes)) {
    app.route(k, v);
}

app.notFound((c) => {
    return c.text("Not found.", 404);
});

app.onError((error, c) => {
    rolleLogger.error(error);

    if (error instanceof RolleError) {
        return error.getResponse();
    }

    if (error instanceof HTTPException) {
        return error.getResponse();
    }

    return c.text("Runtime error.", 500);
});

const port = 3000;
rolleLogger.info(`Server is running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});

import { Hono } from "hono";
import { placesApi } from "@rolle/api_places";
import { HTTPException } from "hono/http-exception";

const router = new Hono<HonoRolle>();

router.get("/search", async (c) => {
    const { lat, lng, query } = c.req.query();

    if (typeof lat === "undefined" || typeof lng === "undefined" || typeof query === "undefined") {
        throw new HTTPException(400, {
            message: "`lat`, `lng` and `query` params should be set.",
        });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const result = await placesApi.searchNearby(query, { latitude, longitude });
    return c.json(result);
});

export default router;

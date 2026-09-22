import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { placesApi } from "@rolle/api_places";
import { ListModel, UserModel, VenueModel } from "@rolle/core";
import { getDb } from "src/database";

const router = new Hono<HonoRolle>();

router.get("/", async (c) => {
    const { lat, lng, query } = c.req.query();

    if (typeof lat === "undefined" || typeof lng === "undefined" || typeof query === "undefined") {
        throw new HTTPException(400, {
            message: "`lat`, `lng` and `query` params should be set.",
        });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const db = await getDb();

    const [places, users, lists] = await Promise.all([
        placesApi.searchNearby(query, { latitude, longitude }),
        UserModel.getMany(
            {
                pagination: {
                    page: 1,
                    limit: 3,
                },
                filter: {
                    nickname: ["~", query],
                },
            },
            db,
        ),
        ListModel.getMany(
            {
                pagination: { page: 1, limit: 3 },
                filter: { name: ["@@", query], private: ["=", false] },
            },
            db,
        ),
    ]);
    const sanitizedUsers = users.data.map(UserModel.sanitize);

    return c.json({ places, lists, users: sanitizedUsers });
});

router.get("/p", async (c) => {
    const { lat, lng, query } = c.req.query();

    if (typeof lat === "undefined" || typeof lng === "undefined" || typeof query === "undefined") {
        throw new HTTPException(400, {
            message: "`lat`, `lng` and `query` params should be set.",
        });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const places = await placesApi.searchNearby(query, { latitude, longitude });

    return c.json(places);
});

router.get("/v", async (c) => {
    const { lat, lng, query } = c.req.query();

    if (typeof lat === "undefined" || typeof lng === "undefined" || typeof query === "undefined") {
        throw new HTTPException(400, {
            message: "`lat`, `lng` and `query` params should be set.",
        });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const db = await getDb();
    const venues = await VenueModel.getMany(
        {
            pagination: { page: 1, limit: 3 },
            geo: { longitude, latitude },
            filter: { name: ["@@", query] },
        },
        db,
    );

    return c.json(venues);
});

router.get("/u", async (c) => {
    const { query } = c.req.query();

    if (typeof query === "undefined") {
        throw new HTTPException(400, {
            message: "`query` param should be set.",
        });
    }

    const db = await getDb();
    const users = await UserModel.getMany(
        {
            pagination: {
                page: 1,
                limit: 3,
            },
            filter: {
                nickname: ["~", query],
            },
        },
        db,
    );
    const sanitizedUsers = users.data.map(UserModel.sanitize);

    return c.json(sanitizedUsers);
});

router.get("/l", async (c) => {
    const { query } = c.req.query();

    if (typeof query === "undefined") {
        throw new HTTPException(400, {
            message: "`query` param should be set.",
        });
    }

    const db = await getDb();
    const lists = await ListModel.getMany(
        {
            pagination: { page: 1, limit: 5 },
            filter: { name: ["@@", query], private: ["=", false] },
        },
        db,
    );

    return c.json(lists);
});

export default router;

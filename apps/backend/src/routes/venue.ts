import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import {
    ListModel,
    recordIdFromString,
    TABLE_VENUE_CATEGORY,
    VenueModel,
    type QueryResolverFilterArgs,
} from "@rolle/core";
import { RolleError } from "@rolle/error";
import { placesApi } from "@rolle/api_places";

import { jwtAuth } from "src/middlewares";
import { getDb } from "src/database";

import type { CreateVenuePayload, Venue } from "@rolle/types";

const router = new Hono<HonoRolle>();

router.get("/", async (c) => {
    const { latitude, longitude, page, limit, category } = c.req.query();

    if (
        typeof latitude === "undefined" ||
        typeof longitude === "undefined" ||
        typeof page === "undefined" ||
        typeof limit === "undefined"
    ) {
        throw new RolleError({
            code: "Rolle.Request.MissingParam",
            message: "Necessario latitude, longitude, page e limit como parametros.",
        });
    }

    const filter: QueryResolverFilterArgs<Venue> = {};
    if (category) {
        filter["category"] = ["=", recordIdFromString(category)];
    }

    const db = await getDb();
    const venues = await VenueModel.getMany(
        {
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10) },
            geo: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            filter,
        },
        db,
    );
    return c.json(venues);
});

/**
 * Tries to retrieve venue from database. If it has no match,
 * creates a new venue record in the database in return's it.
 */
router.get("/google/:placeId", async (c) => {
    const placeId = c.req.param("placeId");
    const db = await getDb();
    let venue = await VenueModel.getByGooglePlaceId(placeId, db);

    if (typeof venue !== "undefined") {
        return c.json(venue);
    }

    const placeDetails = await placesApi.details(placeId);
    if (placeDetails.length === 0) {
        throw new HTTPException(404, { message: "Place id not found." });
    }
    venue = await VenueModel.createFromBusinessDetailedInfo(placeDetails[0], db);

    return c.json(venue);
});

router.get("/c/:category", async (c) => {
    const categoryParam = c.req.param("category");
    const { latitude, longitude, page, limit } = c.req.query();
    const db = await getDb();
    const category = recordIdFromString<typeof TABLE_VENUE_CATEGORY>(
        `${TABLE_VENUE_CATEGORY}:${categoryParam}`,
    );

    const venues = await VenueModel.getMany(
        {
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10) },
            geo: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            filter: { category: ["=", category] },
        },
        db,
    );
    return c.json(venues);
});

router.get("/:uri", async (c) => {
    const decodedUri = c.req.param("uri");
    const { latitude, longitude } = c.req.query();
    const uri = encodeURIComponent(decodedUri);
    const db = await getDb();
    const venue = await VenueModel.getOne(
        {
            geo: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            include: ["meta"],
            filter: {
                uri: ["=", uri],
            },
        },
        db,
    );

    if (typeof venue === "undefined") {
        throw new HTTPException(404, { message: "Venue not found." });
    }

    return c.json(venue);
});

router.get("/:uri/lists", async (c) => {
    const decodedUri = c.req.param("uri");
    const uri = encodeURIComponent(decodedUri);
    const db = await getDb();
    const venue = await VenueModel.getOne(
        {
            filter: {
                uri: ["=", uri],
            },
        },
        db,
    );

    if (typeof venue === "undefined") {
        throw new HTTPException(404, { message: "Venue not found." });
    }

    const lists = await ListModel.getManyFromVenueId(venue.id, db);
    return c.json(lists);
});

/**
 * Private routes
 */
router.use(jwtAuth);
router.post("/", async (c) => {
    const body = await c.req.json<CreateVenuePayload>();
    const db = await getDb();
    const venue = await VenueModel.create(body, db);
    return c.json(venue);
});

export default router;

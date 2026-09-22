import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import * as s3 from "@rolle/s3";
import {
    ListModel,
    S3_USER_FOLDER,
    UserModel,
    VenueModel,
    imageSharp,
    isHttpUrl,
    recordIdFromString,
    type QueryResolverFilterArgs,
} from "@rolle/core";
import { getDb } from "src/database";
import { jwtAuth } from "src/middlewares";
import { logger } from "$lib";

import type {
    UserAlreadyBeenRequestPayload,
    UserBookmarkListRequestPayload,
    UserBookmarkVenueRequestPayload,
} from "@rolle/api";
import type { UpdateUserPayload, Venue } from "@rolle/types";

const router = new Hono<HonoRolle>();

router.get("/suggested", async (c) => {
    const limit = c.req.query("limit");
    const db = await getDb();
    const users = await UserModel.getMany(
        {
            pagination: {
                page: 1,
                limit: Number(limit) || 5,
            },
            filter: { verified: ["=", true] },
            include: ["meta"],
        },
        db,
    );
    return c.json(users.data.map(UserModel.sanitize));
});

router.get("/n/:nickname", async (c) => {
    const nickname = c.req.param("nickname");
    const db = await getDb();
    const user = await UserModel.getOne(
        {
            filter: {
                nickname: ["=", nickname],
            },
            include: ["meta", "followers", "following"],
        },
        db,
    );

    if (typeof user === "undefined") {
        throw new HTTPException(404, { message: "User not found." });
    }

    return c.json(UserModel.sanitize(user));
});

router.get("/n/:nickname/bookmarks/venue", async (c) => {
    const { nickname } = c.req.param();
    const { latitude, longitude, page, limit } = c.req.query();
    const db = await getDb();
    const user = await UserModel.getOne(
        { filter: { nickname: ["=", nickname] }, include: ["bookmarks"] },
        db,
    );

    if (typeof user === "undefined") {
        throw new HTTPException(404, { message: "User not found." });
    }

    const filter: QueryResolverFilterArgs<Venue> = {
        id: ["IN", user.bookmarks.venues.map((b) => b.id)],
    };

    const city = c.req.query("city");
    if (typeof city === "string") {
        filter["address.city.fullName"] = ["=", city];
    }

    const categories = c.req.queries("categories");
    if (typeof categories !== "undefined") {
        filter["category"] = ["IN", categories.map(recordIdFromString<"venueCategory">)];
    }

    const venues = await VenueModel.getMany(
        {
            geo: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10) },
            filter,
        },
        db,
    );

    return c.json(venues);
});

router.get("/n/:nickname/bookmarks/list", async (c) => {
    const { nickname } = c.req.param();
    const { page, limit } = c.req.query();
    const db = await getDb();
    const user = await UserModel.getOne(
        { filter: { nickname: ["=", nickname] }, include: ["bookmarks"] },
        db,
    );

    if (typeof user === "undefined") {
        throw new HTTPException(404, { message: "User not found." });
    }

    const lists = await ListModel.getMany(
        {
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10) },
            filter: {
                id: ["IN", user.bookmarks.lists.map((l) => l.id)],
                private: ["=", false],
            },
        },
        db,
    );

    return c.json(lists);
});

router.get("/n/:nickname/lists", async (c) => {
    const nickname = c.req.param("nickname");
    const db = await getDb();
    const user = await UserModel.getOne({ filter: { nickname: ["=", nickname] } }, db);

    if (typeof user === "undefined") {
        throw new HTTPException(404, { message: "User not found." });
    }

    const lists = await ListModel.getManyFromUserId(user.id, false, db);
    return c.json(lists);
});

/**
 * Private routes
 */
router.use(jwtAuth);

router.get("/lists", async (c) => {
    const user = c.get("user")!;
    const db = await getDb();
    const lists = await ListModel.getManyFromUserId(user.id, true, db);
    return c.json(lists);
});

router.post("/follow/:id", async (c) => {
    const userId = c.req.param("id");
    const db = await getDb();
    const loggedUser = c.get("user")!;
    const user = await UserModel.getById(recordIdFromString(userId), db);

    if (typeof user === "undefined") {
        throw new HTTPException(404, { message: "User not found." });
    }

    try {
        await UserModel.follow(loggedUser.id, user.id, db);
        return c.json(true);
    } catch (error) {
        logger.error("Something went wront while trying to follow a user:", error);
        return c.json(false);
    }
});

router.post("/unfollow/:id", async (c) => {
    const userId = c.req.param("id");
    const db = await getDb();
    const loggedUser = c.get("user")!;
    const user = await UserModel.getById(recordIdFromString(userId), db);

    if (typeof user === "undefined") {
        throw new HTTPException(404, { message: "User not found." });
    }

    try {
        await UserModel.unfollow(loggedUser.id, user.id, db);
        return c.json(true);
    } catch (error) {
        logger.error("Something went wront while trying to unfollow the user:", error);
        return c.json(false);
    }
});

router.post("/bookmark/venue", async (c) => {
    const user = c.get("user")!;
    const payload = await c.req.json<UserBookmarkVenueRequestPayload>();
    const db = await getDb();
    const venue = await VenueModel.getOrCreateByGooglePlaceId(payload.placeId, db);

    if (typeof venue === "undefined") {
        throw new HTTPException(404, { message: "Place id not found." });
    }

    await VenueModel.bookmarkBy(user.id, venue.id, db);

    const updatedUser = await UserModel.getById(user.id, db);

    return c.json(UserModel.sanitize(updatedUser!));
});

router.post("/bookmark/list", async (c) => {
    const user = c.get("user")!;
    const payload = await c.req.json<UserBookmarkListRequestPayload>();
    const db = await getDb();
    const list = await ListModel.getById(recordIdFromString(payload.listId), db);

    if (typeof list === "undefined") {
        throw new HTTPException(404, { message: "List id not found." });
    }

    if (user.id === list.owner.id) {
        throw new HTTPException(400, { message: "List owner can't bookmark own list." });
    }

    await ListModel.bookmarkBy(user.id, list.id, db);

    const updatedUser = await UserModel.getById(user.id, db);

    return c.json(UserModel.sanitize(updatedUser!));
});

router.post("/alreadyBeen", async (c) => {
    const user = c.get("user")!;
    const payload = await c.req.json<UserAlreadyBeenRequestPayload>();
    const db = await getDb();
    const venue = await VenueModel.getOrCreateByGooglePlaceId(payload.placeId, db);

    if (typeof venue === "undefined") {
        throw new HTTPException(404, { message: "Place id not found." });
    }

    await VenueModel.alreadyBeenBy(user.id, venue.id, db);

    const updatedUser = await UserModel.getById(user.id, db);

    return c.json(UserModel.sanitize(updatedUser!));
});

router.patch("/", async (c) => {
    const user = c.get("user")!;
    const payload = await c.req.json<UpdateUserPayload>();
    const db = await getDb();

    let pictureUrl: string | undefined = undefined;
    if (typeof payload.pictureBase64 === "string" && isHttpUrl(payload.pictureBase64)) {
        delete payload.pictureBase64;
    } else if (typeof payload.pictureBase64 === "string") {
        const match = payload.pictureBase64.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!match) {
            throw new HTTPException(400, { message: "Malformed image base64." });
        }
        // const mimeType = match[1];
        const b64 = match[2];
        const base64buffer = Buffer.from(b64, "base64");
        const buffer = await imageSharp.compressImage(base64buffer, {
            size: imageSharp.oneByOne.medium,
        });
        const result = await s3.uploadImage(S3_USER_FOLDER, user.nickname, buffer, "image/webp");
        if (
            user.pictureUrl !==
            "https://rolleimages.s3.sa-east-1.amazonaws.com/user/RolleTeste-549ebce1-d686-48fc-89d6-e43154ca0a9a.webp"
        ) {
            await s3.deleteImage(user.pictureUrl);
        }
        pictureUrl = result.url;
        delete payload.pictureBase64;
    }

    const result = await UserModel.updateOne(user.id, { ...payload, pictureUrl }, db);
    return c.json(result);
});

export default router;

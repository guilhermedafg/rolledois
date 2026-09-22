import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import {
    ListModel,
    VenueModel,
    recordIdFromString,
    TABLE_EVENT,
    TABLE_LIST,
    TABLE_VENUE,
    TABLE_VENUE_CATEGORY,
    S3_LIST_FOLDER,
    isHttpUrl,
    imageSharp,
} from "@rolle/core";
import { jwtAuth } from "src/middlewares";
import { getDb } from "src/database";

import type {
    AddCommentToListPayload,
    AddVenueToListPayload,
    CreateList,
    CreateListPayload,
    RemoveVenueFromListPayload,
    UpdateList,
    UpdateListPayload,
} from "@rolle/types";
import * as s3 from "@rolle/s3";
import { RolleError } from "@rolle/error";

const router = new Hono<HonoRolle>();

const DEFAULT_LIST_IMAGE_URL =
    "https://rolleimages.s3.sa-east-1.amazonaws.com/list/lista%20padrao-4e617091-54bc-4323-a076-0f5545dbf505.webp";

router.get("/suggested", async (c) => {
    const db = await getDb();
    const lists = await ListModel.getMany(
        { pagination: { limit: 12, page: 1 }, filter: { ["owner.nickname"]: ["=", "rolle"] } },
        db,
    );
    return c.json(lists);
});

router.get("/n/:nickname", async (c) => {
    const nickname = c.req.param("nickname");
    const { page, limit } = c.req.query();
    const db = await getDb();
    const lists = await ListModel.getMany(
        {
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10) },
            filter: {
                ["owner.nickname"]: ["=", nickname],
                private: ["=", false],
            },
        },
        db,
    );
    return c.json(lists);
});

router.get("/c/:category", async (c) => {
    const { page, limit } = c.req.query();
    const categoryParam = c.req.param("category");
    const db = await getDb();
    const category = recordIdFromString<typeof TABLE_VENUE_CATEGORY>(
        `${TABLE_VENUE_CATEGORY}:${categoryParam}`,
    );

    const lists = await ListModel.getMany(
        {
            pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10) },
            filter: {
                ["venues.*.record.category"]: ["CONTAINS", category],
                private: ["=", false],
            },
        },
        db,
    );

    return c.json(lists);
});

router.get("/u/:uri", async (c) => {
    const uri = c.req.param("uri");
    const { latitude, longitude } = c.req.query();
    const db = await getDb();
    const list = await ListModel.getByUri(
        uri,
        { geo: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) } },
        db,
    );
    if (typeof list === "undefined")
        throw new RolleError({ code: "Rolle.Resource.NotFound", message: "Lista não encontrada." });

    return c.json(list);
});

router.use(jwtAuth);

router.get("/private", async (c) => {
    const { page, limit } = c.req.query();
    const user = c.get("user")!;
    const db = await getDb();

    const lists = await ListModel.getMany(
        {
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
            },
            filter: {
                ["owner.nickname"]: ["=", user.nickname],
                private: ["=", true],
            },
        },
        db,
    );

    return c.json(lists);
});

router.post(
    "/",
    bodyLimit({
        maxSize: 8 * 1024 * 1024, // 8mb
        onError: (c) => {
            return c.json({ message: "Image too big, try compressing it first." }, 413);
        },
    }),
    async (c) => {
        const user = c.get("user")!;
        const payload = await c.req.json<CreateListPayload>();
        const db = await getDb();

        let cover = {
            url: DEFAULT_LIST_IMAGE_URL,
            thumbUrl: DEFAULT_LIST_IMAGE_URL,
        } satisfies CreateList["cover"];
        if (typeof payload.imageBase64 !== "undefined") {
            const match = payload.imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
                // const mimeType = match[1];
                const b64 = match[2];
                const base64buffer = Buffer.from(b64, "base64");

                const [thumbBuffer, buffer] = await Promise.all([
                    imageSharp.compressImage(base64buffer, { size: imageSharp.twoByThree.small }),
                    imageSharp.compressImage(base64buffer, { size: imageSharp.twoByThree.large }),
                ]);

                const [s3thumbUrl, s3Url] = await Promise.all([
                    s3.uploadImage(
                        S3_LIST_FOLDER,
                        `${payload.name}-thumb`,
                        thumbBuffer,
                        "image/webp",
                    ),
                    s3.uploadImage(S3_LIST_FOLDER, payload.name, buffer, "image/webp"),
                ]);

                cover = {
                    thumbUrl: s3thumbUrl.url,
                    url: s3Url.url,
                };
            }
            delete payload.imageBase64;
        }

        const list = await ListModel.create(
            {
                ...payload,
                owner: user.id,
                cover,
                venues: payload.venues.map((id) => ({
                    record: recordIdFromString<typeof TABLE_VENUE>(id),
                })),
                events: payload.events.map(recordIdFromString<typeof TABLE_EVENT>),
            },
            db,
        );
        return c.json(list);
    },
);

router.post("/:id/addVenue", async (c) => {
    const user = c.get("user")!;
    const listId = recordIdFromString<typeof TABLE_LIST>(c.req.param("id"));
    const payload = await c.req.json<AddVenueToListPayload>();
    const db = await getDb();
    const [list, venue] = await Promise.all([
        ListModel.getById(listId, db),
        VenueModel.getOrCreateByGooglePlaceId(payload.placeId, db),
    ]);

    if (typeof list === "undefined") {
        throw new HTTPException(404, { message: "List not found." });
    }

    if (list.owner.id.toString() !== user.id.toString()) {
        throw new HTTPException(401, { message: "List do not belong to the authenticated user." });
    }

    if (typeof venue === "undefined") {
        throw new HTTPException(404, { message: "Place id not found." });
    }

    if (list.venues.findIndex((v) => v.record.toString() === venue.id.toString()) !== -1) {
        throw new HTTPException(400, { message: "Venue already on this list." });
    }

    const updatedList = await ListModel.addVenue(
        {
            listId,
            venueId: venue.id,
        },
        db,
    );

    return c.json(updatedList);
});

router.post("/:id/removeVenue", async (c) => {
    const user = c.get("user")!;
    const listId = recordIdFromString<typeof TABLE_LIST>(c.req.param("id"));
    const payload = await c.req.json<RemoveVenueFromListPayload>();
    const db = await getDb();
    const [list, venue] = await Promise.all([
        ListModel.getById(listId, db),
        VenueModel.getOrCreateByGooglePlaceId(payload.placeId, db),
    ]);

    if (typeof list === "undefined") {
        throw new HTTPException(404, { message: "List not found." });
    }

    if (list.owner.id.toString() !== user.id.toString()) {
        throw new HTTPException(401, { message: "List do not belong to the authenticated user." });
    }

    if (typeof venue === "undefined") {
        throw new HTTPException(404, { message: "Venue not found." });
    }

    const updatedList = await ListModel.removeVenue({ listId, venueId: venue.id }, db);
    return c.json(updatedList);
});

router.post("/:id/comment", async (c) => {
    const user = c.get("user")!;
    const listId = recordIdFromString<typeof TABLE_LIST>(c.req.param("id"));
    const payload = await c.req.json<AddCommentToListPayload>();
    const db = await getDb();
    const list = await ListModel.getById(listId, db);

    if (typeof list === "undefined") {
        throw new HTTPException(404, { message: "List not found." });
    }

    if (list.owner.id.toString() !== user.id.toString()) {
        throw new HTTPException(401, { message: "List do not belong to the authenticated user." });
    }

    const updatedList = await ListModel.comment(listId, payload, db);
    return c.json(updatedList);
});

router.patch("/:id", async (c) => {
    const user = c.get("user")!;
    const listId = recordIdFromString<typeof TABLE_LIST>(c.req.param("id"));
    const payload = await c.req.json<UpdateListPayload>();
    const db = await getDb();
    const list = await ListModel.getById(listId, db);

    if (typeof list === "undefined") {
        throw new HTTPException(404, { message: "List not found." });
    }

    if (list.owner.id.toString() !== user.id.toString()) {
        throw new HTTPException(401, { message: "List do not belong to the authenticated user." });
    }

    let cover: UpdateList["cover"] = undefined;
    if (typeof payload.imageBase64 === "string" && isHttpUrl(payload.imageBase64)) {
        delete payload.imageBase64;
    } else if (typeof payload.imageBase64 === "string") {
        const match = payload.imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!match) {
            throw new HTTPException(400, { message: "Invalid Base64 image string" });
        }
        // const mimeType = match[1];
        const b64 = match[2];
        const base64buffer = Buffer.from(b64, "base64");

        const [thumbBuffer, buffer] = await Promise.all([
            imageSharp.compressImage(base64buffer, { size: imageSharp.twoByThree.small }),
            imageSharp.compressImage(base64buffer, { size: imageSharp.twoByThree.large }),
        ]);

        const [s3thumbUrl, s3Url] = await Promise.all([
            s3.uploadImage(S3_LIST_FOLDER, `${list.name}-thumb`, thumbBuffer, "image/webp"),
            s3.uploadImage(S3_LIST_FOLDER, list.name, buffer, "image/webp"),
        ]);

        if (typeof list.cover !== "undefined") {
            if (
                list.cover.url !== DEFAULT_LIST_IMAGE_URL &&
                list.cover.thumbUrl !== DEFAULT_LIST_IMAGE_URL
            ) {
                await Promise.all([
                    s3.deleteImage(list.cover.thumbUrl),
                    s3.deleteImage(list.cover.url),
                ]);
            }
        }

        cover = {
            thumbUrl: s3thumbUrl.url,
            url: s3Url.url,
        };
        delete payload.imageBase64;
    }

    const result = await ListModel.updateOne(list.id, { ...payload, cover }, db);
    return c.json(result);
});

router.delete("/:id", async (c) => {
    const user = c.get("user")!;
    const id = recordIdFromString<typeof TABLE_LIST>(c.req.param("id"));
    const db = await getDb();
    const list = await ListModel.getById(id, db);

    if (typeof list === "undefined") {
        throw new RolleError({
            code: "Rolle.Resource.NotFound",
            message: "Lista não encontrada.",
        });
    }

    if (!user.id.equals(list.owner.id)) {
        throw new RolleError({
            code: "Rolle.Auth.Forbidden",
            message: "Usuário não é dono da lista.",
        });
    }

    const success = await ListModel.deleteOne(id, db);
    return c.json(success);
});

export default router;

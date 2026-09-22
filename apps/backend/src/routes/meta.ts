import { Hono } from "hono";
import { ai, instagram, recordIdFromString, sleep, UserModel, VenueModel } from "@rolle/core";
import { redisApi } from "@rolle/api_redis";
import { placesApi, type BusinessInfo } from "@rolle/api_places";
import { RolleError } from "@rolle/error";
import { getDb } from "src/database";
import { jwtAuth } from "src/middlewares";

import type Surreal from "surrealdb";
import type { InstagramWebhookMessageResponse, InstagramWebhookResponse, User } from "@rolle/types";
import { logger } from "$lib";

const router = new Hono<HonoRolle>();

async function handlePlacesFromInstagram(
    senderId: string,
    body: InstagramWebhookMessageResponse,
    user: User,
    db: Surreal,
) {
    await instagram.sendMessage(
        senderId,
        `Vamos salvar aqui na sua conta rolle e já retorno uma mensagem confirmando que deu tudo certo!`,
    );
    const aiResults = await ai.extractPlacesFromInstagramPost(body);
    if (typeof aiResults === "undefined") return;

    if (aiResults.places.length === 0) {
        await instagram.sendMessage(
            senderId,
            `Não conseguimos extrair nenhum local do post que foi enviado :(\n\nProvavelmente o @ ou nome do lugar não se encontra na legenda.`,
        );
        return;
    }

    const searchQueries = aiResults.places.map((result) => `${result.name} - ${result.address}`);
    const searchPromises = searchQueries.map((query) => placesApi.search(query));

    // NOTE: This is necessary due to places api rate limiter.
    const searchResults: BusinessInfo[] = [];
    for (const searchPromise of searchPromises) {
        try {
            const result = await searchPromise;
            await sleep(10_000); // 10secs
            if (result.length === 0) {
                continue;
            }
            searchResults.push(result[0]);
        } catch (error) {
            if (error instanceof Error) {
                logger.warn(error.message);
            }
        }
    }

    let bookmarkedVenues: string[] = [];
    let alreadyBookmarkedVenues: string[] = [];

    for (const place of searchResults) {
        let venue = await VenueModel.getByGooglePlaceId(place.placeId, db);

        if (typeof venue === "undefined") {
            try {
                const placeDetails = await placesApi.details(place.placeId);
                // NOTE: This is necessary due to places api rate limiter.
                await sleep(10_000);
                if (placeDetails.length === 0) {
                    continue;
                }
                venue = await VenueModel.createFromBusinessDetailedInfo(placeDetails[0], db);
            } catch (error) {
                if (error instanceof Error) {
                    logger.warn(error.message);
                }
            }
        }

        if (typeof venue === "undefined") continue;

        if (await VenueModel.isBookmarkedBy(user.id, venue.id, db)) {
            alreadyBookmarkedVenues.push(
                `${venue.name}\n${venue.address?.city.fullName}, ${venue.address?.state.fullName}`,
            );
            continue;
        }

        await VenueModel.bookmarkBy(user.id, venue.id, db);
        bookmarkedVenues.push(
            `${venue.name}\n${venue.address?.city.fullName}, ${venue.address?.state.fullName}`,
        );
    }

    if (bookmarkedVenues.length > 0) {
        await instagram.sendMessage(
            senderId,
            `Pronto, salvamos estes lugares no seu perfil:\n${bookmarkedVenues.join("\n\n")}`,
        );
    }
    if (alreadyBookmarkedVenues.length > 0) {
        await instagram.sendMessage(
            senderId,
            `Ah, estes lugares já estão salvos:\n${alreadyBookmarkedVenues.join("\n\n")}`,
        );
    }
}

/**
 * Links a rolle account to an instagram account.
 */
async function handleCode(code: number, senderId: string, db: Surreal) {
    const redisUserId = await redisApi.client.get(code.toString());
    if (redisUserId === null) return;

    const userId = recordIdFromString<"user">(redisUserId);
    const user = await UserModel.getById(userId, db);
    if (typeof user === "undefined") {
        throw new RolleError({
            code: "Rolle.Resource.NotFound",
            message: "Usuário não encontrado.",
        });
    }

    if (typeof user.providers?.instagramId !== "undefined") {
        throw new RolleError({
            code: "Rolle.Provider.AlreadyLinked",
            message: "Conta ja vinculada.",
        });
    }

    const updatedUser = await UserModel.updateOne(
        userId,
        {
            providers: {
                instagramId: senderId,
            },
        },
        db,
    );

    await Promise.all([
        redisApi.client.del(code.toString()),
        redisApi.client.del(user.id.toString()),
    ]);

    return updatedUser;
}

/**
 * Messaging
 */
const TODO_ROLLE_ID = "17841458345472597";

/**
 * Validation bridge with meta api.
 */
router.get("/webhook", (c) => {
    const mode = c.req.query("hub.mode");
    const verifyToken = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge");

    if (mode !== "subscribe") return c.text("Invalid mode.", 400);
    if (verifyToken !== process.env.INSTAGRAM_VERIFY_TOKEN) return c.text("Invalid token.", 400);
    if (typeof challenge !== "string") return c.text("Missing challenge.", 400);
    return c.text(challenge, 200);
});

/**
 * Event handler.
 */
router.post("/webhook", async (c) => {
    const body = await c.req.json<InstagramWebhookResponse>();
    const db = await getDb();

    if (instagram.isMessaging(body)) {
        if (!instagram.isMessageText(body) && !instagram.isMessageAttachments(body)) {
            return c.text("EVENT_RECEIVED", 200);
        }

        const senderId = body.entry[0].messaging[0].sender.id;
        if (senderId === TODO_ROLLE_ID) return c.text("EVENT_RECEIVED", 200);

        const user = await UserModel.getOne(
            { filter: { ["providers.instagramId"]: ["=", senderId] } },
            db,
        );

        // NO USER FOUND
        if (typeof user === "undefined") {
            // TEXT MESSAGE
            if (instagram.isMessageText(body)) {
                const message = body.entry[0].messaging[0].message.text;
                // MAYBE CODE DETECTED!
                if (message.length === 6) {
                    const code = instagram.parseCode(message);

                    // CODE DETECTED!
                    if (typeof code === "number") {
                        const connectedUser = await handleCode(code, senderId, db);

                        // ACCOUNT LINKING SUCCESS
                        if (typeof connectedUser !== "undefined") {
                            await instagram.sendMessage(
                                senderId,
                                `${connectedUser.nickname}, sua conta do instagram foi vinculada com sucesso com a nossa plataforma!`,
                            );
                            // ACCOUNT LINKING FAIL
                        } else {
                            await instagram.sendMessage(
                                senderId,
                                "Algo deu errado ao vincular sua conta.",
                            );
                        }

                        return c.text("EVENT_RECEIVED", 200);
                    }
                }
            }

            // DEFAULT NO CODE AND NO ACCOUNT LINKED
            await instagram.sendMessage(
                senderId,
                "Esta conta do instagram ainda não esta vinculada a nenhum perfil do rolle.\n Vincule agora entrando nas configurações do seu perfil na nossa plataforma!",
            );
            return c.text("EVENT_RECEIVED", 200);
        }

        // USER FOUND
        // SIMPLE MESSAGE
        if (instagram.isMessageText(body)) {
            await instagram.sendMessage(
                senderId,
                `Oi ${user.nickname}, essa é uma mensagem automática.\n\nBasta encaminhar na nossa conversa o que você quer guardar no seu perfil rolle e nós salvamos para você!\n\nImportante: O @ ou o nome do local devem estar na leganda.\n\nVeja seus lugares salvos em https://www.rolle.com.br/u/${user.nickname}`,
            );
            return c.text("EVENT_RECEIVED", 200);
        }

        // ATTACHMENT MESSAGE
        if (instagram.isMessageAttachments(body)) {
            handlePlacesFromInstagram(senderId, body, user, db);
            return c.text("EVENT_RECEIVED", 200);
        }
    }

    return c.text("EVENT_RECEIVED", 200);
});

router.use(jwtAuth);

router.get("/code", async (c) => {
    const user = c.get("user")!;
    const code = await redisApi.client.get(user.id.toString());

    if (code === null) {
        throw new RolleError({
            code: "Rolle.Resource.NotFound",
            message: "Nenhum código vinculado.",
        });
    }
    const expiration = await redisApi.client.ttl(user.id.toString());

    return c.json({ code: parseInt(code, 10), expiration });
});

router.get("/gen-code", async (c) => {
    const user = c.get("user")!;

    let codeGenerated = instagram.generateCode();
    while ((await redisApi.client.get(codeGenerated.toString())) !== null) {
        codeGenerated = instagram.generateCode();
    }

    await redisApi.client.set(codeGenerated.toString(), user.id.toString(), {
        expiration: {
            type: "EX",
            value: 10 * 60, // 10 minutes
        },
    });

    await redisApi.client.set(user.id.toString(), codeGenerated.toString(), {
        expiration: {
            type: "EX",
            value: 10 * 60, // 10 minutes
        },
    });

    const expiration = await redisApi.client.ttl(user.id.toString());

    return c.json({ code: codeGenerated, expiration });
});

export default router;

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { verify } from "argon2";
import { OAuth2Client } from "google-auth-library";

import { getDb } from "src/database";
import {
    imageSharp,
    recordIdFromString,
    ResetPasswordModel,
    S3_USER_FOLDER,
    TABLE_USER,
    UserModel,
} from "@rolle/core";
import { rolleMail } from "@rolle/mail";
import { RolleError } from "@rolle/error";
import * as s3 from "@rolle/s3";
import {
    generateToken,
    getSecureCookie,
    getBearerTokenPayload,
    setSecureCookie,
    deleteSecureCookie,
} from "$lib";

import type { CreateUser, CreateUserPayload } from "@rolle/types";
import type { GoogleSignRequestPayload, SignInRequestPayload } from "@rolle/api";

const ACCESS_TOKEN_EXPIRATION = 60 * 5;
const REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 7;
const RESET_PASSWORD_TOKEN_EXPIRATION = 60 * 15;

/**
 * Generates both `acessToken` and `refreshToken`.
 */
async function generateTokens(userId: string) {
    if (typeof process.env.JWT_SECRET === "undefined") {
        throw new RolleError({
            code: "Rolle.Server.Internal",
            message: "Segredo JWT não encontrado no arquivo .env.",
        });
    }

    const now = Math.floor(Date.now() / 1000);

    const [accessToken, refreshToken] = await Promise.all([
        /* Five minutes expiration date */
        generateToken({ sub: userId, exp: now + ACCESS_TOKEN_EXPIRATION, iat: now }),
        /* One week expiration date */
        generateToken({
            sub: userId,
            exp: now + REFRESH_TOKEN_EXPIRATION,
            nbf: now + ACCESS_TOKEN_EXPIRATION,
            iat: now,
        }),
    ]);

    return {
        accessToken: `Bearer ${accessToken}`,
        refreshToken: `Bearer ${refreshToken}`,
    };
}

const router = new Hono<HonoRolle>();

router.get("/refreshToken", async (c) => {
    const token = await getSecureCookie(c, "refreshToken");

    if (!token) {
        throw new RolleError({ code: "Rolle.Auth.Forbidden", message: "Refresh token faltando." });
    }

    try {
        const payload = await getBearerTokenPayload(token);
        const userId = <string>payload.sub;
        const newTokens = await generateTokens(userId);
        await setSecureCookie(c, "refreshToken", newTokens.refreshToken);
        return c.json({ accessToken: newTokens.accessToken });
    } catch (_error) {
        throw new RolleError({ code: "Rolle.Auth.Forbidden", message: "Refresh token faltando." });
    }
});

router.get("/signout", (c) => {
    deleteSecureCookie(c, "refreshToken");
    return c.json(true);
});

/**
 * Email and password
 */

router.post(
    "/signup",
    bodyLimit({
        maxSize: 8 * 1024 * 1024, // 8mb
        onError: (c) => {
            return c.json({ message: "Image too big, try compressing it first." }, 413);
        },
    }),
    async (c) => {
        const body = await c.req.json<CreateUserPayload>();
        const db = await getDb();

        let pictureUrl =
            "https://rolleimages.s3.sa-east-1.amazonaws.com/user/RolleTeste-549ebce1-d686-48fc-89d6-e43154ca0a9a.webp";

        if (typeof body.pictureBase64 !== "undefined") {
            const match = body.pictureBase64.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
                // const mimeType = match[1];
                const b64 = match[2];
                const base64buffer = Buffer.from(b64, "base64");

                const buffer = await imageSharp.compressImage(base64buffer, {
                    size: imageSharp.oneByOne.medium,
                });

                const result = await s3.uploadImage(
                    S3_USER_FOLDER,
                    body.nickname,
                    buffer,
                    "image/webp",
                );
                pictureUrl = result.url;
            }
        }

        delete body.pictureBase64;
        const user = await UserModel.create({ ...body, pictureUrl }, db);
        const { accessToken, refreshToken } = await generateTokens(user.id.toString());

        await setSecureCookie(c, "refreshToken", refreshToken);
        return c.json({ accessToken });
    },
);

router.post("/signin", async (c) => {
    const body = await c.req.json<SignInRequestPayload>();
    const db = await getDb();
    const user = await UserModel.getOne(
        {
            filter: {
                email: ["=", body.email],
            },
        },
        db,
    );

    if (!user) {
        throw new RolleError({
            code: "Rolle.Input.Validation",
            message: "Email não cadastrado.",
            meta: {
                fields: {
                    email: "Email não cadastrado.",
                },
            },
        });
    }

    if (typeof user.password === "undefined") {
        throw new RolleError({
            code: "Rolle.Auth.WrongMethod",
            message: "Email vinculado a login social.",
            meta: {
                fields: {
                    email: "Email vinculado a login social.",
                },
            },
        });
    }

    const match = await verify(user.password, body.password);

    if (!match) {
        throw new RolleError({
            code: "Rolle.Auth.Validation",
            message: "Senha incorreta.",
            meta: {
                fields: {
                    password: "Senha incorreta.",
                },
            },
        });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id.toString());
    await setSecureCookie(c, "refreshToken", refreshToken);
    return c.json({ accessToken });
});

/**
 * GOOGLE
 */

const googleOauth2Client = new OAuth2Client({
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    clientId: process.env.GOOGLE_CLIENT_ID,
    redirectUri: process.env.GOOGLE_CLIENT_REDIRECT_URI,
});

const googleScope = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

router.get("/google/generate-auth-url", (c) => {
    const url = googleOauth2Client.generateAuthUrl({
        scope: googleScope,
    });

    return c.json({ url });
});

router.post("/google", async (c) => {
    const body = await c.req.json<GoogleSignRequestPayload>();

    const token = await googleOauth2Client.getToken({
        code: body.code,
    });

    if (typeof token.tokens.id_token === "undefined" || token.tokens.id_token === null) {
        throw new RolleError({
            code: "Rolle.Server.Internal",
            message: "Não foi possível encontrar o ID do token Google.",
        });
    }

    const loginToken = await googleOauth2Client.verifyIdToken({
        idToken: token.tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = loginToken.getPayload();

    if (typeof payload === "undefined") {
        throw new RolleError({
            code: "Rolle.Server.Internal",
            message: "Algo deu errado durante a autenticação com o Google.",
        });
    }

    const db = await getDb();

    try {
        let user = await UserModel.getByProvider("google", payload.sub, db);
        if (typeof user === "undefined") {
            /** Known for sure that `name` will be present inside the payload */
            const name = payload.name!.split(" ");
            const userPayload = {
                nickname: `user-${Date.now()}`,
                /** Known for sure that `email` will be present inside the payload */
                email: payload.email!,
                name: {
                    first: name.shift() || "?",
                    last: name.join(" ") || "?",
                },
                pictureUrl:
                    payload.picture ||
                    "https://fastly.picsum.photos/id/129/80/80.jpg?hmac=8DCDNa08YKEzDXZnt8pbM4EZ-kAx2w90L7aLiv3rrRY",
                providers: {
                    googleId: payload.sub,
                },
            } satisfies CreateUser;
            user = await UserModel.create(userPayload, db);
        }
        const tokens = await generateTokens(user.id.toString());
        await setSecureCookie(c, "refreshToken", tokens.refreshToken);
        return c.json({ accessToken: tokens.accessToken });
    } catch (_error) {
        throw new RolleError({
            code: "Rolle.Input.Validation",
            message: "Algo deu errado durante o cadastro com o Google.",
        });
    }
});

router.post("/forgot-password", async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    const db = await getDb();
    const user = await UserModel.getOne(
        {
            filter: {
                email: ["=", email],
            },
        },
        db,
    );

    if (typeof user === "undefined") {
        throw new RolleError({ code: "Rolle.Resource.NotFound", message: "Email não encontrado." });
    }

    if (typeof user.password === "undefined") {
        throw new RolleError({
            code: "Rolle.Input.Validation",
            message: "Email vinculado ao login social.",
        });
    }

    const now = Math.floor(Date.now() / 1000);
    const token = await generateToken({
        sub: user.id.toString(),
        iat: now,
        exp: now + RESET_PASSWORD_TOKEN_EXPIRATION,
    });
    await ResetPasswordModel.create({ resetToken: token, user: user.id }, db);

    await rolleMail.sendText({
        from: "noreply",
        to: [user.email],
        subject: "Recuperar senha",
        text:
            "Recupere sua senha clicando nesse link: https://rolle.com.br/auth/reset-password?token=" +
            token,
    });

    return c.json(true);
});

router.post("/reset-password", async (c) => {
    const { password, token } = await c.req.json();

    if (typeof password !== "string" || typeof token !== "string") {
        throw new RolleError({
            code: "Rolle.Input.Validation",
            message: "Payload malformado.",
        });
    }

    const db = await getDb();
    const resetPassword = await ResetPasswordModel.getOne(
        { filter: { resetToken: ["=", token] } },
        db,
    );

    if (typeof resetPassword === "undefined") {
        throw new RolleError({
            code: "Rolle.Resource.NotFound",
            message: "Token inválido.",
        });
    }

    try {
        const tokenPayload = await getBearerTokenPayload("Bearer " + token);
        const userId = recordIdFromString<typeof TABLE_USER>(tokenPayload.sub as string);
        await UserModel.updateOne(userId, { password }, db);
        await ResetPasswordModel.delete(
            {
                filter: {
                    user: ["=", userId],
                },
            },
            db,
        );
        return c.json(true);
    } catch (error) {
        if (!(error instanceof Error)) {
            throw new RolleError({
                code: "Rolle.Server.Internal",
                message: "Something went wrong...",
            });
        }

        if (error.name === "JwtTokenExpired") {
            await ResetPasswordModel.deleteById(resetPassword.id, db);
            throw new RolleError({
                code: "Rolle.Auth.Validation",
                message: "Token expirado.",
            });
        }
    }
    return c.json(false);
});

router.post("/check-email", async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    const db = await getDb();

    const user = await UserModel.getOne(
        {
            filter: {
                email: ["=", email],
            },
        },
        db,
    );

    if (!user) {
        throw new RolleError({
            code: "Rolle.Resource.NotFound",
            message: "Email não cadastrado.",
            meta: {
                fields: {
                    email: "Email não cadastrado.",
                },
            },
        });
    }

    if (typeof user.password !== "undefined") {
        return c.json({ type: "credential" });
    } else {
        return c.json({ type: "social" });
    }
});

router.post("/check-nickname", async (c) => {
    const { nickname } = await c.req.json<{ nickname: string }>();
    const db = await getDb();

    const user = await UserModel.getOne(
        {
            filter: {
                nickname: ["=", nickname],
            },
        },
        db,
    );

    return c.json(user !== undefined);
});

export default router;

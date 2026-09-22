/* eslint-disable @typescript-eslint/naming-convention */
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RolleError } from "@rolle/error";
import { randomUUID } from "node:crypto";

const prod = process.env.NODE_ENV === "production";

const BUCKET_NAME = "rolleimages";
const ENDPOINT = prod ? "https://s3.sa-east-1.amazonaws.com" : "http://s3mock:9090";
const URL_ENDPOINT = prod
    ? `https://${BUCKET_NAME}.s3.sa-east-1.amazonaws.com`
    : `http://localhost:9090/${BUCKET_NAME}`;

const MIME_TYPES_ACCEPTED = new Set([
    "image/gif",
    "image/png",
    "image/jpeg",
    "image/bmp",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/avif",
]);

const accessKeyId = prod ? process.env.S3_KEY_ID! : "s3mock";
const secretAccessKey = prod ? process.env.S3_SECRET_KEY_ID! : "s3mock";

const s3Client = new S3Client({
    region: "sa-east-1",
    endpoint: ENDPOINT,
    forcePathStyle: !prod,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export async function uploadImage(folder: string, name: string, payload: any, contentType: string) {
    if (!MIME_TYPES_ACCEPTED.has(contentType)) {
        throw new RolleError({
            code: "Rolle.Input.Validation",
            message: `Content-type "${contentType}" não aceito.`,
        });
    }

    const imageExt = contentType.split("/")[1];
    const key = `${name}-${randomUUID()}.${imageExt}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${folder}/${key}`,
        Body: payload,
        ACL: !prod ? "public-read" : undefined,
        ContentType: contentType,
    });

    const result = await s3Client.send(command);

    return {
        url: `${URL_ENDPOINT}/${folder}/${encodeURIComponent(key)}`,
        etag: result.ETag,
    };
}

export async function deleteImage(url: string) {
    try {
        const [_, folder, key] = url.substring(URL_ENDPOINT.length).split("/");
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${folder}/${key}`,
        });
        await s3Client.send(command);
        return true;
    } catch (_) {
        return false;
    }
}

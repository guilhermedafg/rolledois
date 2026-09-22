import type {
    InstagramMessageAttachments,
    InstagramMessageText,
    InstagramWebhookMessageResponse,
    InstagramWebhookResponse,
    InstragramSendMessageResponse,
} from "@rolle/types";

/**
 * Code section.
 */
const MIN = 100_000;
const MAX = 999_999;
export function generateCode() {
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

export function parseCode(text: string) {
    const code = parseInt(text, 10);
    if (Number.isNaN(code)) return;
    return code;
}

/**
 * Type checking section.
 */
export function isMessaging(
    payload: InstagramWebhookResponse,
): payload is InstagramWebhookMessageResponse {
    return Object.hasOwn(payload.entry[0], "messaging");
}

export function isMessageText(
    payload: InstagramWebhookMessageResponse,
): payload is InstagramWebhookMessageResponse & {
    entry: [{ messaging: [{ message: InstagramMessageText }] }];
} {
    const obj = payload.entry[0].messaging[0];
    return Object.hasOwn(obj, "message") && Object.hasOwn(obj.message!, "text");
}

export function isMessageAttachments(
    payload: InstagramWebhookMessageResponse,
): payload is InstagramWebhookMessageResponse & {
    entry: [{ messaging: [{ message: InstagramMessageAttachments }] }];
} {
    const obj = payload.entry[0].messaging[0];
    return Object.hasOwn(obj, "message") && Object.hasOwn(obj.message!, "attachments");
}

/**
 * Messaging section.
 */
const PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_TODO_ROLLE_TOKEN as string;

export async function sendMessage(recipientId: string, message: string) {
    const response = await fetch(`https://graph.instagram.com/v25.0/me/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            recipient: {
                id: recipientId,
            },
            message: {
                text: message,
            },
        }),
    });
    return (await response.json()) as InstragramSendMessageResponse;
}

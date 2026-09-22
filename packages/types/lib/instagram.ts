export interface InstagramMessageText {
    mid: string;
    text: string;
}

export interface InstagramMessageAttachments {
    mid: string;
    attachments: [
        {
            type: "ig_reel" | string;
            payload: {
                reel_video_id: string;
                title: string;
                url: string;
            };
        },
    ];
}

export interface InstagramWebhookMessageResponse {
    object: "instagram";
    entry: [
        {
            id: string;
            time: number;
            messaging: [
                {
                    sender: {
                        id: string;
                    };
                    recipient: {
                        id: string;
                    };
                    timestamp: number;
                    message?: InstagramMessageText | InstagramMessageAttachments;
                },
            ];
        },
    ];
}

export interface InstagramWebhookNewCommentResponse {
    object: "instagram";
    entry: [
        {
            id: string;
            time: number;
            changes: [
                {
                    field: "comments";
                    value: {
                        from: {
                            id: string;
                            username: string;
                        };
                        media: {
                            id: string;
                            media_product_type: "FEED" | string;
                        };
                        id: string;
                        text: string;
                    };
                },
            ];
        },
    ];
}

export type InstagramWebhookResponse =
    | InstagramWebhookMessageResponse
    | InstagramWebhookNewCommentResponse;

export interface InstragramSendMessageResponse {
    recipient_id: string;
    message_id: string;
}

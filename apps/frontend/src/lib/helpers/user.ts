import type { User } from "@rolle/types";
import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

export async function handleUserShare(mixpanel: Mixpanel, user: Pick<User, "id" | "nickname">) {
    mixpanel.track("click_user_share", { id: user.id, nickname: user.nickname });
    const userUrl =
        process.env.NODE_ENV === "development"
            ? `http://localhost:5173/u/${user.nickname}`
            : `https://rolle.com.br/u/${user.nickname}`;
    const hasClipboard =
        typeof navigator.clipboard !== "undefined" &&
        typeof navigator.clipboard.writeText !== "undefined";

    if (!navigator.share && !hasClipboard) return;
    if (!navigator.share && hasClipboard) {
        await navigator.clipboard.writeText(userUrl);
        return;
    }

    try {
        await navigator.share({
            title: `Rolle - @${user.nickname}`,
            url: userUrl,
        });
    } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
            await navigator.clipboard.writeText(userUrl);
        }
    }
}

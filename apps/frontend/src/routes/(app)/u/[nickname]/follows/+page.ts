import { isAxiosError } from "axios";
import { error } from "@sveltejs/kit";
import { rolleApi } from "@rolle/api";

import type { PageLoad } from "./$types";

export const prerender = false;
export const load: PageLoad = async ({ params }) => {
    try {
        const user = await rolleApi.user.getByNickname(params.nickname);

        return {
            user,
        };
    } catch (err) {
        if (!isAxiosError(err)) {
            error(500, "Internal Server Error.");
        }

        error(err.status!, "User not found.");
    }
};

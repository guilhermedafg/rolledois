import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
    const code = url.searchParams.get("code");

    if (typeof code === "undefined" || code === null) {
        throw error(400, { message: "Missing google code." });
    }

    return { code };
};

import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
    const token = url.searchParams.get("token");
    if (!token) {
        return error(400, { message: "Token faltando na url." });
    }
    return { token };
};

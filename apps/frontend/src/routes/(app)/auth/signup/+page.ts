import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { Validators } from "@rolle/form";

export const load: PageLoad = async ({ url }) => {
    const email = url.searchParams.get("email");
    if (email === null) {
        throw error(400, { message: "Email necessário na url." });
    }

    const [valid, message] = await Validators.email(email);
    if (!valid) {
        throw error(400, { message });
    }

    return { email };
};

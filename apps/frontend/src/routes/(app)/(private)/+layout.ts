import { redirect } from "@sveltejs/kit";
import { userStore } from "$lib/store";
import { browser } from "$app/environment";

import type { LayoutLoad } from "./$types";

export const prerender = false;
export const load: LayoutLoad = async () => {
    if (!browser) return;

    if (!(await userStore.tryInit())) {
        return redirect(308, "/auth/signin");
    }
};

import { rolleApi } from "@rolle/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    const lists = await rolleApi.list.getSuggested();
    return { lists };
};

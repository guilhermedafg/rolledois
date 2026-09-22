import { rolleApi } from "@rolle/api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const lists = await rolleApi.list.getManyByUserNickname("rolle");
    return { lists };
};

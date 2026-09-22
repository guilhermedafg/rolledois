import { rolleApi } from "@rolle/api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const suggestedUsers = await rolleApi.user.getManySuggested(5);
    return { suggestedUsers };
};

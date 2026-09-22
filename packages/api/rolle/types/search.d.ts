import { List, User } from "@rolle/types";
import { BusinessInfo } from "@rolle/api_places";

export interface SearchResponsePayload {
    places: BusinessInfo[];
    users: User[];
    lists: List[];
}

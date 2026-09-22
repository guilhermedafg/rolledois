import type { AxiosInstance } from "axios";
import type {
    List,
    ListFull,
    Paginated,
    PaginationArgs,
    UpdateUserPayload,
    User as UserType,
    Venue,
    UserFull,
    VenueCategory,
} from "@rolle/types";
import type { LatLng } from "@rolle/geo";

export class User {
    /**
     * User base url.
     */
    static URL = "/user" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving a user by it's nickname.
     */
    async getByNickname(nickname: string) {
        const response = await this._axios.get<UserFull>(`${User.URL}/n/${nickname}`);
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a user venue bookmarks by it's nickname.
     */
    async getVenueBookmarksByNickname(
        nickname: string,
        geo: LatLng,
        pagination: PaginationArgs = { page: 1, limit: 10 },
        filters?: {
            city?: string;
            categories?: string[];
        },
    ) {
        const response = await this._axios.get<
            Paginated<Venue, { categories: VenueCategory["id"][] }>
        >(`${User.URL}/n/${nickname}/bookmarks/venue`, {
            params: {
                page: pagination.page,
                limit: pagination.limit,
                latitude: geo.latitude,
                longitude: geo.longitude,
                city: filters?.city,
                categories: filters?.categories,
            },
            paramsSerializer: {
                indexes: null,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a user list bookmarks by it's nickname.
     */
    async getListBookmarksByNickname(
        nickname: string,
        pagination: PaginationArgs = { page: 1, limit: 10 },
    ) {
        const response = await this._axios.get<Paginated<List>>(
            `${User.URL}/n/${nickname}/bookmarks/list`,
            {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                },
            },
        );
        return response.data;
    }

    /**
     * GET HTTP request for retrieving many suggested users.
     */
    async getManySuggested(limit: number) {
        const response = await this._axios.get<Array<UserType>>(
            `${User.URL}/suggested?limit=${limit}`,
        );
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a user by it's nickname.
     */
    async getLists() {
        const response = await this._axios.get<Array<ListFull>>(`${User.URL}/lists`);
        return response.data;
    }

    /**
     * POST HTTP request for following another user.
     */
    async follow(userId: string) {
        const response = await this._axios.post<boolean>(`${User.URL}/follow/${userId}`);
        return response.data;
    }

    /**
     * POST HTTP request for unfollowing another user.
     */
    async unfollow(userId: string) {
        const response = await this._axios.post<boolean>(`${User.URL}/unfollow/${userId}`);
        return response.data;
    }

    /**
     * POST HTTP request for bookmarking a place.
     */
    async bookmarkVenue(placeId: string) {
        const response = await this._axios.post<UserFull>(`${User.URL}/bookmark/venue`, {
            placeId,
        });
        return response.data;
    }

    /**
     * POST HTTP request for bookmarking a list.
     */
    async bookmarkList(listId: string) {
        const response = await this._axios.post<UserFull>(`${User.URL}/bookmark/list`, {
            listId,
        });
        return response.data;
    }

    /**
     * POST HTTP request for marking a place as already been visited.
     */
    async alreadyBeen(placeId: string) {
        const response = await this._axios.post<UserFull>(`${User.URL}/alreadyBeen`, {
            placeId,
        });
        return response.data;
    }

    async update(payload: UpdateUserPayload) {
        const response = await this._axios.patch<UserFull>(`${User.URL}`, payload);
        return response.data;
    }
}

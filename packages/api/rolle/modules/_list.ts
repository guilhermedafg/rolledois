import { Venue } from "./_venue";
import type { AxiosInstance } from "axios";
import type {
    AddCommentToListPayload,
    AddVenueToListPayload,
    CreateListPayload,
    List as ListType,
    Paginated,
    PaginationArgs,
    RemoveVenueFromListPayload,
    UpdateListPayload,
    ListFull,
} from "@rolle/types";
import type { LatLng } from "@rolle/geo";

export class List {
    /**
     * List base url.
     */
    static URL = "/list" as const;

    /**
     * Axios instance.
     */
    private _axios: AxiosInstance;

    constructor(axios: AxiosInstance) {
        this._axios = axios;
    }

    /**
     * GET HTTP request for retrieving a list by its uri.
     */
    async getByUri(uri: string, geo: LatLng) {
        const response = await this._axios.get<ListFull>(`${List.URL}/u/${uri}`, {
            params: { latitude: geo.latitude, longitude: geo.longitude },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a list of suggested lists.
     */
    async getSuggested() {
        const response = await this._axios.get<Paginated<ListType>>(`${List.URL}/suggested`);
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a list of lists by its owner nickname.
     */
    async getManyByUserNickname(
        nickname: string,
        pagination: PaginationArgs = { page: 1, limit: 10 },
    ) {
        const response = await this._axios.get<Paginated<ListType>>(`${List.URL}/n/${nickname}`, {
            params: {
                page: pagination.page,
                limit: pagination.limit,
            },
        });
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a list of lists that contains the venue.
     */
    async getManyByVenueUri(uri: string) {
        const response = await this._axios.get<Array<ListType>>(`${Venue.URL}/${uri}/lists`);
        return response.data;
    }

    /**
     * GET HTTP request for retrieving a list of lists by its venues category.
     */
    async getManyByVenueCategory(
        category: string,
        pagination: PaginationArgs = { page: 1, limit: 10 },
    ) {
        const response = await this._axios.get<Paginated<ListType>>(`${List.URL}/c/${category}`, {
            params: {
                page: pagination.page,
                limit: pagination.limit,
            },
        });
        return response.data;
    }

    async getManyPrivate(pagination: PaginationArgs = { page: 1, limit: 10 }) {
        const response = await this._axios.get<Paginated<ListType>>(`${List.URL}/private`, {
            params: {
                page: pagination.page,
                limit: pagination.limit,
            },
        });
        return response.data;
    }

    /**
     * POST HTTP request for creating a list.
     */
    async create(payload: CreateListPayload) {
        const response = await this._axios.post<ListType>(`${List.URL}`, payload);
        return response.data;
    }

    /**
     * POST HTTP request for adding a venue to an existing list.
     */
    async addVenue(listId: string, payload: AddVenueToListPayload) {
        const response = await this._axios.post<ListFull>(
            `${List.URL}/${encodeURIComponent(listId)}/addVenue`,
            payload,
        );
        return response.data;
    }

    /**
     * POST HTTP request for removing a venue from an existing list.
     */
    async removeVenue(listId: string, payload: RemoveVenueFromListPayload) {
        const response = await this._axios.post<ListFull>(
            `${List.URL}/${encodeURIComponent(listId)}/removeVenue`,
            payload,
        );
        return response.data;
    }

    /**
     * POST HTTP request for setting a comment for one venue inside the list.
     */
    async comment(listId: string, payload: AddCommentToListPayload) {
        const response = await this._axios.post<ListFull>(
            `${List.URL}/${encodeURIComponent(listId)}/comment`,
            payload,
        );
        return response.data;
    }

    /**
     * PATCH HTTP request for updating a list.
     */
    async update(listId: string, payload: UpdateListPayload) {
        const response = await this._axios.patch<ListType>(
            `${List.URL}/${encodeURIComponent(listId)}`,
            payload,
        );
        return response.data;
    }

    /**
     * DELETE HTTP request for deleting a list.
     */
    async deleteOne(id: string) {
        const response = await this._axios.delete<boolean>(`${List.URL}/${encodeURIComponent(id)}`);
        return response.data;
    }
}

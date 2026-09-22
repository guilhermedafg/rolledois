import { writable } from "svelte/store";

interface CreateListState {
    open: boolean;
    placeId?: string;
}

export const createListModalState = writable<CreateListState>({
    open: false,
    placeId: undefined,
});

export function toggleCreateListModal() {
    createListModalState.update((state) => ({
        ...state,
        open: !state.open,
    }));
}

export function setCreateListPlaceId(placeId: CreateListState["placeId"]) {
    createListModalState.update((state) => ({
        ...state,
        placeId,
    }));
}

import { writable } from "svelte/store";

interface AddVenueToListState {
    open: boolean;
    placeId?: string;
}

export const addVenueToListModalState = writable<AddVenueToListState>({
    open: false,
    placeId: undefined,
});

export function openAddVenueToListModal(opts: { placeId: string }) {
    addVenueToListModalState.update(() => ({
        placeId: opts.placeId,
        open: true,
    }));
}

export function closeAddVenueToListModal() {
    addVenueToListModalState.update(() => ({
        placeId: undefined,
        open: false,
    }));
}

import { writable, derived } from "svelte/store";

import { getCurrentPos, type LatLng } from "@rolle/geo";

/** Fallback is center of `Curitiba` city. */
const fallbackPosition = { latitude: -25.4951166, longitude: -49.2897982 } satisfies LatLng;

function createCurrentPositionStore() {
    const { subscribe, set } = writable<LatLng>(fallbackPosition);

    async function updatePosition() {
        set(await getCurrentPos(fallbackPosition));
    }

    return { subscribe, set, updatePosition };
}

export const currentPositionStore = createCurrentPositionStore();

export const gotPositionStore = derived(
    currentPositionStore,
    (pos) =>
        pos.latitude !== fallbackPosition.latitude && pos.longitude !== fallbackPosition.longitude,
);

export const mapZoomStore = writable<number>(13.5);

import { derived, writable } from "svelte/store";
import { Form, Field } from "@rolle/form";
import { browser } from "$app/environment";

import type { BusinessInfo } from "@rolle/api_places";
import type { List, User, Venue } from "@rolle/types";

export const searchPlacesResultStore = writable<BusinessInfo[]>([]);
export const searchVenuesResultStore = writable<Venue[]>([]);
export const searchUsersResultStore = writable<User[]>([]);
export const searchListsResultStore = writable<List[]>([]);

export function clearSearchResults() {
    searchVenuesResultStore.set([]);
    searchPlacesResultStore.set([]);
    searchUsersResultStore.set([]);
    searchListsResultStore.set([]);
}

export const searchFormStore = new Form({
    query: new Field<string>("", []),
});

const LOCAL_STORAGE_SEARCH_HISTORY = "rolle-search-history";
function createSearchHistoryStore() {
    const { set, update, subscribe } = writable<Array<string>>([], (set) => {
        if (!browser) return set([]);
        try {
            const localStorageData = localStorage.getItem(LOCAL_STORAGE_SEARCH_HISTORY);
            if (localStorageData === null) return set([]);
            return set(JSON.parse(localStorageData));
        } catch (_) {
            return set([]);
        }
    });

    function syncLocalStorage(value: string[]) {
        try {
            if (!browser) return;
            localStorage.setItem(LOCAL_STORAGE_SEARCH_HISTORY, JSON.stringify(value));
        } catch (_) {
            return;
        }
    }

    function addEntry(entry: string) {
        update((history) => {
            const temp = [entry, ...history].slice(0, 3);
            syncLocalStorage(temp);
            return temp;
        });
    }

    function removeEntry(entry: string) {
        update((history) => {
            const temp = history.filter((h) => h !== entry);
            syncLocalStorage(temp);
            return temp;
        });
    }

    function clear() {
        syncLocalStorage([]);
        set([]);
    }

    return { subscribe, addEntry, removeEntry, clear };
}

export const searchHistoryStore = createSearchHistoryStore();

export const searchResultsEmptyStore = derived(
    [
        searchPlacesResultStore,
        searchVenuesResultStore,
        searchUsersResultStore,
        searchListsResultStore,
    ],
    ([places, venues, users, lists]) => {
        return (
            places.length === 0 && venues.length === 0 && users.length === 0 && lists.length === 0
        );
    },
);

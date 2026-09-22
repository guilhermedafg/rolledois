import { get, writable } from "svelte/store";
import { goto, replaceState } from "$app/navigation";

import { rolleApi, type SignInRequestPayload } from "@rolle/api";
import type { UpdateUserPayload, UserFull } from "@rolle/types";

export const isBookmarkingStore = writable<string | undefined>(undefined);

function createUserStore() {
    const { subscribe, set } = writable<UserFull | undefined>();

    /**
     * Tries to fetch user.
     * Returns true if user was fetch successfully and false
     * if the user is not authenticated.
     */
    async function tryInit() {
        if (get(userStore)) {
            return true;
        }

        try {
            const user = await rolleApi.profile.me();
            set(user);
            return true;
        } catch (_error) {
            return false;
        }
    }

    /**
     * Sync user store with backend.
     */
    async function refresh() {
        const user = await rolleApi.profile.me();
        set(user);
    }

    /**
     * Signs user in.
     */
    async function signIn(payload: SignInRequestPayload) {
        await rolleApi.auth.signIn(payload);
        const user = await rolleApi.profile.me();
        set(user);
    }

    /**
     * Signs user out.
     */
    async function signOut() {
        await rolleApi.auth.signOut();
        await goto("/");
        replaceState("", {});
        set(undefined);
    }

    /**
     * Bookmarks a venue.
     */
    async function bookmarkVenue(placeId: string) {
        try {
            if (typeof get(isBookmarkingStore) === "undefined") {
                isBookmarkingStore.set(placeId);
                const updatedUser = await rolleApi.user.bookmarkVenue(placeId);
                isBookmarkingStore.set(undefined);
                set(updatedUser);
            }
        } catch (_) {
            isBookmarkingStore.set(undefined);
        }
    }

    /**
     * Bookmarks a list.
     */
    async function bookmarkList(listId: string) {
        const updatedUser = await rolleApi.user.bookmarkList(listId);
        set(updatedUser);
    }

    /**
     * Already been to a venue.
     */
    async function alreadyBeen(placeId: string) {
        const updatedUser = await rolleApi.user.alreadyBeen(placeId);
        set(updatedUser);
    }

    /**
     * Follows another user.
     */
    async function follow(userId: string) {
        await rolleApi.user.follow(userId);
        await refresh();
    }

    /**
     * Unfollows another user.
     */
    async function unfollow(userId: string) {
        await rolleApi.user.unfollow(userId);
        await refresh();
    }

    async function update(payload: UpdateUserPayload) {
        if (payload.phone?.length === 0) delete payload.phone;
        await rolleApi.user.update(payload);
        await refresh();
    }

    return {
        subscribe,
        tryInit,
        refresh,
        signIn,
        signOut,
        bookmarkVenue,
        bookmarkList,
        alreadyBeen,
        update,
        follow,
        unfollow,
    };
}

export const userStore = createUserStore();

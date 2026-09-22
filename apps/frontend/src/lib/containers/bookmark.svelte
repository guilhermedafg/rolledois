<script lang="ts">
    import { BookmarkIcon, SpinnerGapIcon } from "phosphor-svelte";
    import { page } from "$app/state";
    import { userStore } from "$lib/store";
    import {
        addVenueToListModalState,
        openAddVenueToListModal,
        toggleSigninModal,
    } from "$lib/modals";

    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        /** Defaults to `small` */
        variant?: "small" | "large";
        placeId: string;
        mixpanel: Mixpanel;
    }

    const { variant = "small", placeId, mixpanel }: Props = $props();
    let loading = $state(false);
    let bookmarked = $derived(
        typeof $userStore !== "undefined" &&
            $userStore.bookmarks.venues.find((b) => b.googlePlaceId === placeId),
    );

    async function handleBookmark(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof $userStore === "undefined") {
            toggleSigninModal();
            return;
        }
        if (loading) return;
        if (!$addVenueToListModalState.open && bookmarked)
            return openAddVenueToListModal({ placeId });
        loading = true;
        mixpanel.track("bookmark", {
            from: page.url.pathname,
            placeId: placeId,
        });
        await userStore.bookmarkVenue(placeId).finally(() => {
            loading = false;
        });

        if (!$addVenueToListModalState.open) openAddVenueToListModal({ placeId });
    }
</script>

<button
    type="button"
    onclick={handleBookmark}
    class={[
        "bg-primary-400 flex-nowrap rounded-lg border p-2 text-sm font-medium whitespace-nowrap cursor-pointer",
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "h-fit w-fit": variant === "small",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "inline-flex h-full items-center justify-center px-2": variant === "large",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "shadow-text border-text -translate-y-0.5 shadow-[0_4px]": bookmarked,
        },
    ]}
>
    {#if loading}
        <SpinnerGapIcon size={16} class="animate-spin" />
    {:else if bookmarked}
        <BookmarkIcon size={16} weight="fill" />
    {:else}
        <BookmarkIcon size={16} />
    {/if}

    {#if variant === "large"}
        {#if loading}
            Carregando
        {:else if bookmarked}
            Salvo
        {:else}
            Salvar
        {/if}
    {/if}
</button>

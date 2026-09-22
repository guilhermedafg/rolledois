<script lang="ts">
    import { Bookmark, SpinnerGap } from "phosphor-svelte";
    import { toggleSigninModal } from "$lib/modals";
    import { userStore } from "$lib/store";

    // import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        /** Defaults to `small` */
        listId: string;
        // mixpanel: Mixpanel;
        active?: boolean;
    }

    const { listId }: Props = $props();
    let loading = $state(false);
    let bookmarked = $derived(
        typeof $userStore !== "undefined" &&
            $userStore.bookmarks.lists.find((b) => b.id.toString() === listId),
    );

    async function handleBookmark(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (typeof $userStore === "undefined") {
            toggleSigninModal();
            return;
        }

        loading = true;
        await userStore.bookmarkList(listId).finally(() => {
            loading = false;
        });
    }
</script>

<button
    type="button"
    onclick={handleBookmark}
    class={[
        "border-text bg-primary-400 inline-flex h-fit w-fit flex-nowrap items-center rounded-lg border p-2 text-sm font-medium whitespace-nowrap transition-all",
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "shadow-text border-text -translate-y-0.5 shadow-[0_4px]": bookmarked,
        },
    ]}
>
    {#if loading}
        <SpinnerGap size={16} class="animate-spin" />
    {:else if bookmarked}
        <Bookmark size={16} weight="fill" />
    {:else}
        <Bookmark size={16} />
    {/if}

    {#if loading}
        Carregando
    {:else if bookmarked}
        Adicionado
    {:else}
        Salvar
    {/if}
</button>

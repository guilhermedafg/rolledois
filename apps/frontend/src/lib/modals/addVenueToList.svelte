<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { fade, fly } from "svelte/transition";
    import { PlusIcon, XIcon } from "phosphor-svelte";
    import { rolleApi } from "@rolle/api";

    import { setCreateListPlaceId, toggleCreateListModal } from "./createList.svelte.ts";
    import { addVenueToListModalState, closeAddVenueToListModal } from "./addVenueToList.svelte.ts";

    import { userStore } from "$lib/store";
    import { Bookmark, ListRow } from "$lib/containers";
    import { useBlockScroll } from "./_util.svelte.ts";

    import type { ListFull } from "@rolle/types";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";
    import { invalidateAll } from "$app/navigation";

    interface Props {
        mixpanel: Mixpanel;
    }

    const { mixpanel }: Props = $props();
    let dialogElement: HTMLDialogElement | undefined = $state();
    let lists: Array<ListFull> = $state([]);
    let backdropButtonElement: HTMLButtonElement | undefined = $state();

    let insideListPage = $derived(page.route.id === "/list/[uri]");
    let orderedLists = $derived(() => {
        if (!insideListPage) return lists;
        const { uri } = page.params;
        const list = lists.find((list) => list.uri === uri);
        if (typeof list === "undefined") return lists;
        const isListOwner = typeof $userStore !== "undefined" && $userStore.id === list.owner.id;
        if (!isListOwner) return lists;
        return [list];
    });

    onMount(refreshLists);

    $effect(() => {
        if ($addVenueToListModalState.open) refreshLists();
    });

    // Prevents scrolling while this modal is open.
    useBlockScroll(() => $addVenueToListModalState.open);

    // Updates backdrop position.
    $effect(() => {
        if ($addVenueToListModalState.open && typeof backdropButtonElement !== "undefined") {
            const scrollY =
                window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            backdropButtonElement.style.transform = `translateY(${scrollY}px)`;
        }
    });

    async function refreshLists() {
        lists = await rolleApi.user.getLists();
    }

    async function handleClick(listId: string, removeVenue: boolean) {
        if (removeVenue) {
            await rolleApi.list.removeVenue(listId, {
                placeId: $addVenueToListModalState.placeId!,
            });
            await refreshLists();
            await invalidateAll();
            return;
        }
        await rolleApi.list.addVenue(listId, { placeId: $addVenueToListModalState.placeId! });
        closeAddVenueToListModal();
        await refreshLists();
        await invalidateAll();
    }

    function handleCreateListClick() {
        setCreateListPlaceId($addVenueToListModalState.placeId);
        closeAddVenueToListModal();
        setTimeout(toggleCreateListModal, 200);
    }
</script>

{#if $addVenueToListModalState.open && $addVenueToListModalState.placeId}
    <button
        bind:this={backdropButtonElement}
        class="sticky top-0 left-0 z-10 h-dvh w-full bg-black/16"
        aria-label="add venue to list backdrop"
        onclick={closeAddVenueToListModal}
        transition:fade={{ duration: 150 }}
    ></button>
    <dialog
        open
        bind:this={dialogElement}
        class="sticky bottom-0 left-0 z-10 flex min-h-64 w-full flex-col gap-4 rounded-t-lg bg-white py-4 shadow-lg shadow-black"
        transition:fly={{ y: dialogElement?.getBoundingClientRect().height || 256, duration: 400 }}
    >
        <!-- header -->
        <div class="relative flex h-fit w-full items-center justify-between px-4">
            <div></div>
            <h6>Salvar em</h6>
            <XIcon size={24} class="cursor-pointer" onclick={closeAddVenueToListModal} />
        </div>

        <!-- only bookmark -->
        <div class="inline-flex items-center justify-between gap-2 px-4">
            <div class="inline-flex items-center gap-2">
                <img
                    src={$userStore?.pictureUrl || "https://picsum.photos/200/200"}
                    alt="User profile"
                    class="aspect-square w-10 rounded-lg object-cover"
                />
                <span class="text-lg">Meus roles</span>
            </div>
            <Bookmark placeId={$addVenueToListModalState.placeId} {mixpanel} />
        </div>

        <!-- lists to save -->
        <div class="flex flex-col gap-2">
            <span class="font-rounded px-4 font-medium">Minhas listas</span>

            {#if lists.length === 0}
                <div class="px-4">Cadastre sua primeira lista!</div>
            {/if}

            <div class="flex max-h-[30dvh] flex-col gap-2 overflow-y-auto">
                {#each orderedLists() as list (list.id)}
                    <ListRow
                        {list}
                        placeId={$addVenueToListModalState.placeId}
                        onclick={(venueOnList) => handleClick(list.id.toString(), venueOnList)}
                    />
                {/each}
            </div>
        </div>
        <button
            type="button"
            onclick={handleCreateListClick}
            class="inline-flex items-center justify-start gap-2 px-4 cursor-pointer"
        >
            <div class="bg-warning grid size-10 place-items-center rounded-lg">
                <PlusIcon size={24} class="fill-white" />
            </div>
            <span class="font-rounded font-medium">Criar lista</span>
        </button>
    </dialog>
{/if}

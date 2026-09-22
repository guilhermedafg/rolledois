<script lang="ts">
    import { goto } from "$app/navigation";
    import {
        BookmarkSimpleIcon,
        CaretRightIcon,
        ExportIcon,
        MapPinSimpleAreaIcon,
        PencilSimpleIcon,
        QuotesIcon,
    } from "phosphor-svelte";
    import { Button, HorizontalScroll, idFromRecordId, VenueCategoryTag } from "@rolle/ui";
    import { userStore } from "$lib/store";

    import Bookmark from "./bookmark.svelte";
    import VenueRow from "./venueRow.svelte";
    import AddVenue from "./addVenue.svelte";

    import type { RecordId } from "surrealdb";
    import type { ListFull } from "@rolle/types";

    const { data } = $props();
    let list = $state((() => data)().list);
    const isListOwner = $derived(
        typeof $userStore !== "undefined" && $userStore.id.toString() === list.owner.id.toString(),
    );

    $effect(() => {
        list = data.list;
    });

    $effect(() => {
        if (!list.private) return;
        if (isListOwner) return;
        goto("/", { replaceState: true });
    });

    const venuesCategories = $derived(list.venues.map((v) => idFromRecordId(v.record.category)));

    const listUrl = $derived(
        process.env.NODE_ENV === "development"
            ? `http://localhost:5173/list/${list.uri}`
            : `https://rolle.com.br/list/${list.uri}`,
    );
    const venueCategories = $derived(new Set(list.venues.map((v) => v.record.category)));
    const hasDescription = $derived(
        typeof list.description !== "undefined" && list.description.length > 0,
    );
    let selectedCategories: string[] = $state([]);

    const venuesDisplayed = $derived(() => {
        if (selectedCategories.length === 0) return list.venues;
        return list.venues.filter((v) => selectedCategories.includes(v.record.category.toString()));
    });

    function handleVenueCategoryFilterClick(categoryId: RecordId<"venueCategory">) {
        const categoryIdString = categoryId.toString();

        if (selectedCategories.includes(categoryIdString)) {
            selectedCategories = selectedCategories.filter((e) => e !== categoryIdString);
            if (selectedCategories.length > 0)
                data.mixpanel.track("click_list_filter", { list_id: list.id, selectedCategories });
            return;
        }

        selectedCategories = [...selectedCategories, categoryIdString];
        data.mixpanel.track("click_list_filter", { list_id: list.id, selectedCategories });
    }

    async function handleShare(_: MouseEvent) {
        data.mixpanel.track("click_list_share", { id: list.id, name: list.name });

        const hasClipboard =
            typeof navigator.clipboard !== "undefined" &&
            typeof navigator.clipboard.writeText !== "undefined";

        if (!navigator.share && !hasClipboard) return;
        if (!navigator.share && hasClipboard) {
            await navigator.clipboard.writeText(listUrl);
            return;
        }

        try {
            await navigator.share({
                title: `Rolle - @${list.name}`,
                url: listUrl,
            });
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                await navigator.clipboard.writeText(listUrl);
            }
        }
    }

    function handleEdit() {
        goto(`${window.location.pathname}/edit`);
    }

    function handleOwnerClick() {
        data.mixpanel.track("click_curator_from_list", { name: list.owner.nickname });
    }

    function handleAfterVenueComment(updatedList: ListFull) {
        list = updatedList;
    }
</script>

<svelte:head>
    <title>{list.name} • por @{list.owner.nickname} no rolle ✦</title>
    <meta name="description" content={list.description} />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="{list.name} • por @{list.owner.nickname} no rolle ✦" />
    <meta property="og:description" content={list.description || venuesCategories.join(", ")} />
    <meta property="og:url" content={listUrl} />
    <meta property="og:image" content={list.cover?.thumbUrl} />
    <meta property="og:site_name" content="Rolle" />
    <meta property="og:locale" content="pt_BR" />

    <!-- 3) Twitter Cards (twitter:*) -->
    <meta name="twitter:card" content={list.cover?.url} />
    <meta name="twitter:site" content="@rolle" />
    <meta name="twitter:title" content="{list.name} • por @{list.owner.nickname} no rolle ✦" />
    <meta name="twitter:description" content={list.description || venuesCategories.join(", ")} />
    <meta name="twitter:image" content={list.cover?.url} />

    <link rel="canonical" href={listUrl} />
</svelte:head>

{#if isListOwner}
    <div class="mt-2 inline-flex h-10 w-full items-center justify-between gap-2 px-4">
        <PencilSimpleIcon size={20} onclick={handleEdit} />
    </div>
{/if}

<div class="mt-4 inline-flex w-full gap-2 px-4">
    <img
        src={list.cover?.url || list.venues[0].record.cover.url}
        alt="List cover"
        class="aspect-2/3 h-44 rounded-lg object-cover"
    />

    <div class="flex flex-col self-center">
        <h6 class="font-bold">{list.name}</h6>

        <div class="inline-flex items-center gap-2">
            <div class="font-rounded inline-flex items-center gap-1 text-xs">
                <MapPinSimpleAreaIcon />
                {list.venues.length} rolle{list.venues.length !== 1 ? "s" : ""}
            </div>
            {#if typeof list.meta?.bookmarksCount === "number" && list.meta.bookmarksCount > 0}
                <div class="font-rounded inline-flex items-center gap-1 text-xs">
                    <BookmarkSimpleIcon />
                    {list.meta.bookmarksCount} pessoa{list.meta.bookmarksCount !== 1 ? "s" : ""}
                    salv{list.meta.bookmarksCount !== 1 ? "aram" : "ou"}
                </div>
            {/if}
        </div>

        <div class="mt-4 inline-flex items-stretch gap-1">
            <Button outlined variation="ghost" onclick={handleShare}>
                <ExportIcon size={20} />
            </Button>

            {#if $userStore?.id !== list.owner.id}
                <Bookmark listId={list.id.toString()} />
            {/if}
        </div>
    </div>
</div>

<div class="bg-background border-text mx-4 mt-4 flex flex-col gap-4 rounded-lg border p-4">
    {#if hasDescription}
        <div class="text-sm whitespace-pre-wrap">
            <QuotesIcon size={40} class="rotate-180" weight="fill" />
            {list.description}
        </div>

        <!-- divisor -->
        <div class="bg-border h-px"></div>
    {/if}

    <a
        href="/u/{list.owner.nickname}"
        onclick={handleOwnerClick}
        class="inline-flex items-center gap-2"
    >
        <img src={list.owner.pictureUrl} alt="List owner" class="size-10 rounded-lg object-cover" />
        <div class="flex flex-1 flex-col items-start justify-center">
            <div class="font-rounded text-sm">{list.owner.name.full}</div>
            <span class="text-secondary-text text-xs">{list.owner.bio.short}</span>
        </div>
        <CaretRightIcon class="text-secondary-text" />
    </a>
</div>

<!-- add new venues -->
{#if isListOwner}
    <div class="mt-4 w-full">
        <AddVenue mixpanel={data.mixpanel} />
    </div>
{/if}

<!-- venue categories -->
<HorizontalScroll class="inline-flex gap-2 p-4">
    {#each venueCategories.values() as categoryId (categoryId)}
        <button onclick={() => handleVenueCategoryFilterClick(categoryId)}>
            <VenueCategoryTag
                active={selectedCategories.includes(categoryId.toString())}
                {categoryId}
            />
        </button>
    {/each}
</HorizontalScroll>

<div class="flex flex-col gap-4">
    {#each venuesDisplayed() as venue (venue.record.id)}
        <VenueRow
            venue={venue.record}
            comment={venue.comment}
            {list}
            mixpanel={data.mixpanel}
            afterComment={handleAfterVenueComment}
        />
    {/each}
</div>

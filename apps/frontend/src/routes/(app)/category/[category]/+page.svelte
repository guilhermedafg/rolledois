<script lang="ts">
    import { CaretLeftIcon, SpinnerGapIcon } from "phosphor-svelte";
    import {
        HorizontalScroll,
        VENUE_CATEGORY_TO_TEXT_PLURAL,
        type VenueCategoryMapped,
    } from "@rolle/ui";
    import { ListCard, VenueGalery } from "$lib/containers";
    import { createPaginationState } from "$lib/helpers";
    import { rolleApi } from "@rolle/api";

    const { data } = $props();
    const { lists, category, geo } = (() => data)();

    let venueSentinel: HTMLDivElement | undefined = $state(undefined);
    const venues = $derived(
        createPaginationState(data.venues, (page: number) =>
            rolleApi.venue.getManyByCategory(category, {
                geo,
                pagination: {
                    page,
                    limit: 10,
                },
            }),
        ),
    );
    $effect(() => {
        if (!venueSentinel) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) venues.nextPage();
            },
            {
                root: null,
                rootMargin: "400px",
                threshold: 0,
            },
        );

        io.observe(venueSentinel);
        return () => io.disconnect();
    });

    function handleGoBack() {
        window.history.back();
    }
</script>

<!-- header -->
<div
    class="mt-2 inline-flex h-10 w-full items-center justify-start gap-2 overflow-hidden px-4 whitespace-nowrap"
>
    <CaretLeftIcon size={24} onclick={handleGoBack} />
    <h6 class="w-full text-center">
        {VENUE_CATEGORY_TO_TEXT_PLURAL[category as VenueCategoryMapped]}
    </h6>
    <div class="w-6"></div>
</div>

<h6 class="mt-2 px-4">Listas para você</h6>
<HorizontalScroll class="mt-2 inline-flex gap-2 px-4">
    {#each lists.data as list (list.id)}
        <div class="w-40 shrink-0">
            <ListCard {list} mixpanel={data.mixpanel} />
        </div>
    {/each}
</HorizontalScroll>

<div class="mt-6 flex flex-col gap-2 px-4">
    {#each venues.data as venue (venue.id)}
        <VenueGalery {venue} mixpanel={data.mixpanel} />
    {/each}

    {#if venues.loading || venues.refetching}
        <div class="mt-4 grid place-items-center">
            <SpinnerGapIcon size={20} class="animate-spin" />
        </div>
    {/if}

    <div bind:this={venueSentinel}></div>
</div>

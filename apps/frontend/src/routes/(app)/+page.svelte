<script lang="ts">
    import "mapbox-gl/dist/mapbox-gl.css";
    import { type Map as MapType } from "mapbox-gl";

    import { untrack } from "svelte";
    import { goto } from "$app/navigation";

    import { Button, HorizontalScroll, idFromRecordId, type VenueCategoryMapped } from "@rolle/ui";
    import { rolleApi } from "@rolle/api";

    import { VenueRow, ListCard } from "$lib/containers";
    import { currentPositionStore, searchResultsEmptyStore } from "$lib/store";
    import { Map, Search } from "./_containers";

    import type { RecordId } from "surrealdb";
    import type { List, Venue } from "@rolle/types";

    const { data } = $props();

    let venuesWrapperElement: HTMLDivElement | undefined = $state();
    let venueWrapperElements: HTMLDivElement[] = $state([]);

    let map: MapType | undefined = $state();

    let venues: Venue[] = $state([]);
    let lists: List[] = $state([]);

    let venueSelected: Venue | undefined = $state();
    let categorySelected: VenueCategoryMapped = $state("todos");

    $effect(() => {
        rolleApi.venue.getMany(1, 20, $currentPositionStore).then((res) => (venues = res.data));
        untrack(() => {
            rolleApi.list.getSuggested().then((res) => (lists = res.data));
        });
    });

    function handleVenueMarkerClick(venue: Venue) {
        if (typeof map === "undefined") return;
        if (typeof venuesWrapperElement === "undefined") return;
        if (typeof venue.geo === "undefined") return;

        const element = venueWrapperElements.find(
            (el) => el.dataset.venueid === venue.id.toString(),
        );
        console.log(element);

        if (typeof element === "undefined") return;

        venueSelected = venue;
        venuesWrapperElement.scrollTo({
            behavior: "smooth",
            left: element.offsetLeft - 16,
        });
        map.flyTo({ center: venue.geo.coordinates, zoom: 15 });
    }

    function handleVenueRowClick(venue: Venue, index: number) {
        if (typeof map === "undefined") return;
        if (typeof venuesWrapperElement === "undefined") return;
        if (typeof venue.geo === "undefined") return;

        venueSelected = venue;
        venuesWrapperElement.scrollTo({
            behavior: "smooth",
            left: venueWrapperElements[index].offsetLeft - 16,
        });
        map.flyTo({ center: venue.geo.coordinates, zoom: 15 });
    }

    async function handleVenueCategoryClick(categoryId: RecordId) {
        venueSelected = undefined;
        const category = idFromRecordId(categoryId) as VenueCategoryMapped;
        categorySelected = category;
        venues = (
            await rolleApi.venue.getManyByCategory(category, {
                geo: $currentPositionStore,
                pagination: { page: 1, limit: 20 },
            })
        ).data;

        if (category === "todos") {
            lists = (await rolleApi.list.getSuggested()).data;
            venues = (await rolleApi.venue.getMany(1, 20, $currentPositionStore)).data;
        } else {
            venues = (
                await rolleApi.venue.getManyByCategory(category, {
                    geo: $currentPositionStore,
                    pagination: { page: 1, limit: 20 },
                })
            ).data;
            lists = (
                await rolleApi.list.getManyByVenueCategory(category, {
                    page: 1,
                    limit: 20,
                })
            ).data;
        }
    }
</script>

<svelte:head>
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Descubra o seu próximo rolle" />
    <meta
        property="og:description"
        content="Explore lugares autênticos • curados por quem realmente vive a cidade."
    />
    <meta property="og:url" content="https://rolle.com.br" />
    <meta
        property="og:image"
        content="https://rolleimages.s3.sa-east-1.amazonaws.com/user/rolle-a8d89d2a-9452-497e-acf7-01fc652d674e.webp"
    />
    <meta property="og:site_name" content="Rolle" />
    <meta property="og:locale" content="pt_BR" />

    <!-- Twitter Cards (twitter:*) -->
    <meta
        name="twitter:card"
        content="https://rolleimages.s3.sa-east-1.amazonaws.com/user/rolle-a8d89d2a-9452-497e-acf7-01fc652d674e.webp"
    />
    <meta name="twitter:site" content="@rolle" />
    <meta name="twitter:title" content="Descubra o seu próximo rolle" />
    <meta
        name="twitter:description"
        content="Explore lugares autênticos • curados por quem realmente vive a cidade."
    />
    <meta name="twitter:image" content="https://rolle.com.br" />
</svelte:head>

<div class="relative">
    <Map
        bind:map
        {venues}
        {venueWrapperElements}
        geo={$currentPositionStore}
        handleMarkerClick={handleVenueMarkerClick}
    />
    <Search onCategoryClick={handleVenueCategoryClick} {categorySelected} />
</div>

{#if $searchResultsEmptyStore}
    <div class="mt-4 relative">
        <div class="px-4 text-xl">Pertos de você</div>

        <HorizontalScroll
            bind:element={venuesWrapperElement}
            class="snap-x snap-mandatory inline-flex px-4 pt-2 pb-4 gap-2"
        >
            {#each venues as venue, index (venue.id)}
                {@const active = venueSelected?.id === venue.id}
                <div
                    bind:this={venueWrapperElements[index]}
                    data-venueid={venue.id}
                    class="w-9/10 shrink-0 snap-center"
                >
                    <VenueRow
                        {active}
                        {venue}
                        href={false}
                        mixpanel={data.mixpanel}
                        onclick={(venue) => handleVenueRowClick(venue, index)}
                    />
                    {#if active}
                        <div class="mt-4">
                            <Button
                                outlined
                                stretch
                                variation="flat"
                                textSize="sm"
                                onclick={() => goto(`/venue/${venue.uri}`)}
                            >
                                Ver mais
                            </Button>
                        </div>
                    {/if}
                </div>
            {/each}
        </HorizontalScroll>
    </div>

    <div class="">
        <div class="px-4 text-xl">Listas da comunidade</div>

        <HorizontalScroll class="mt-2 inline-flex gap-2 px-4">
            {#each lists as list}
                <div class="shrink-0">
                    <ListCard {list} mixpanel={data.mixpanel} />
                </div>
            {/each}
        </HorizontalScroll>
    </div>
{/if}

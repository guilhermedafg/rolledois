<script lang="ts">
    import { slide } from "svelte/transition";
    import { rolleApi } from "@rolle/api";
    import { HorizontalScroll, Textfield } from "@rolle/ui";
    import { Field } from "@rolle/form";
    import { MagnifyingGlassIcon, SpinnerGapIcon } from "phosphor-svelte";

    import { BusinessRow, VenueRow } from "$lib/containers";
    import { currentPositionStore } from "$lib/store";

    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";
    import type { Venue } from "@rolle/types";
    import type { BusinessInfo } from "@rolle/api_places";

    interface Props {
        mixpanel: Mixpanel;
    }

    const { mixpanel }: Props = $props();

    const query = new Field("");
    const { value } = query;

    let loading = $state(false);
    async function handleSearch() {
        loading = true;
        await Promise.all([handleVenueSearch($value), handlePlaceSearch($value)]).finally(
            () => (loading = false),
        );
    }

    let venuesResult: Venue[] = $state([]);
    let venuesLoading = $state(false);
    async function handleVenueSearch(query: string) {
        if (venuesLoading && query.length > 3) return;
        venuesLoading = true;
        await rolleApi.search
            .venues(query, $currentPositionStore)
            .then((res) => (venuesResult = res.data))
            .finally(() => (venuesLoading = false));
    }

    let placesResult: BusinessInfo[] = $state([]);
    let placesLoading = $state(false);
    async function handlePlaceSearch(query: string) {
        if (placesLoading && query.length > 3) return;
        placesLoading = true;
        await rolleApi.search
            .places(query, $currentPositionStore)
            .then((res) => (placesResult = res))
            .finally(() => (placesLoading = false));
    }
</script>

<form onsubmit={handleSearch} class="inline-flex w-full items-stretch px-4">
    <Textfield name="query" placeholder="Adicionar rolle" field={query} />

    {#if $value.length > 0}
        <button transition:slide={{ axis: "x" }} class="grid place-items-center px-2">
            <MagnifyingGlassIcon class="text-secondary-text text-base" />
        </button>
    {/if}
</form>

<!-- Results -->
{#if loading || venuesResult.length > 0 || placesResult.length > 0}
    <div>
        {#if venuesLoading}
            <div class="mt-2 grid place-items-center">
                <SpinnerGapIcon size={20} class="animate-spin" />
            </div>
        {/if}
        {#if venuesResult.length > 0}
            <HorizontalScroll class="mt-2 inline-flex gap-2 px-4">
                {#each venuesResult as venue}
                    <div
                        class={[
                            "shrink-0",
                            {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                "w-full": venuesResult.length === 1,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                "w-[90%]": venuesResult.length > 1,
                            },
                        ]}
                    >
                        <VenueRow {venue} {mixpanel} />
                    </div>
                {/each}
            </HorizontalScroll>
        {/if}
    </div>

    <div>
        {#if placesLoading}
            <div class="mt-2 grid place-items-center">
                <SpinnerGapIcon size={20} class="animate-spin" />
            </div>
        {/if}
        {#if placesResult.length > 0}
            <div class="mt-3 flex flex-col gap-2 px-4">
                {#each placesResult as business (business.googleId)}
                    <BusinessRow {business} {mixpanel} />
                {/each}
            </div>
        {/if}
    </div>
{/if}

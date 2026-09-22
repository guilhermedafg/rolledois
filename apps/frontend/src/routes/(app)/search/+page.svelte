<script lang="ts">
    import { BusinessRow, ListCard, UserRow, VenueRow } from "$lib/containers";
    import { setPausableInterval } from "$lib/helpers";
    import {
        currentPositionStore,
        searchFormStore,
        searchPlacesResultStore,
        searchUsersResultStore,
        searchListsResultStore,
        searchVenuesResultStore,
        clearSearchResults,
        searchHistoryStore,
    } from "$lib/store";
    import { rolleApi } from "@rolle/api";
    import { HorizontalScroll, Textfield } from "@rolle/ui";
    import {
        ArrowCounterClockwise,
        CaretLeft,
        Lightbulb,
        SpinnerGap,
        XCircle,
    } from "phosphor-svelte";
    import { debounce } from "throttle-debounce";

    const { data } = $props();

    const searchSuggestions = ["cafés", "bares", "lojas", "restaurantes"];

    let searchInputElement: HTMLInputElement | undefined = $state();
    const { value, focus } = searchFormStore.fields.query;
    let searchResultsEmpty = $derived(
        $searchPlacesResultStore.length === 0 &&
            $searchVenuesResultStore.length === 0 &&
            $searchUsersResultStore.length === 0 &&
            $searchListsResultStore.length === 0,
    );

    $effect(() => {
        if (typeof searchInputElement === "undefined") return;
        searchInputElement.focus();
    });

    $effect(() => {
        if ($focus) {
            data.mixpanel.track("open_home_search");
            return;
        }
    });

    $effect(() => {
        if ($value.length < 3) {
            handleVenueSearchDebounced.cancel({ upcomingOnly: true });
            handleListSearchDebounced.cancel({ upcomingOnly: true });
            handleUserSearchDebounced.cancel({ upcomingOnly: true });
            handlePlaceSearchDebounced.cancel({ upcomingOnly: true });
            return;
        }
        handleVenueSearchDebounced($value);
        handleListSearchDebounced($value);
        handleUserSearchDebounced($value);
        handlePlaceSearchDebounced($value);
    });

    function emitMixpanelEvent(query: string) {
        data.mixpanel.track("text_search", { query });
    }
    const emitMixpanelEventDebounced = debounce(3000, (query: string) => emitMixpanelEvent(query));

    function handleSearch(value: string) {
        handleVenueSearch(value);
        handlePlaceSearch(value);
        handleUserSearch(value);
        handleListSearch(value);
    }

    function handleFormSubmit() {
        handleSearch($value);
        searchHistoryStore.addEntry($value);
    }

    let placeLoading = $state(false);
    async function handlePlaceSearch(query: string) {
        if (placeLoading && query.length > 3) return;
        placeLoading = true;
        await rolleApi.search
            .places(query, $currentPositionStore)
            .then(searchPlacesResultStore.set)
            .finally(() => (placeLoading = false));
        emitMixpanelEventDebounced(query);
    }
    const handlePlaceSearchDebounced = debounce(1000, (query: string) => handlePlaceSearch(query));

    let venueLoading = $state(false);
    async function handleVenueSearch(query: string) {
        if (venueLoading && query.length > 3) return;
        venueLoading = true;
        await rolleApi.search
            .venues(query, $currentPositionStore)
            .then((res) => searchVenuesResultStore.set(res.data))
            .finally(() => (venueLoading = false));
        emitMixpanelEventDebounced(query);
    }
    const handleVenueSearchDebounced = debounce(1000, (query: string) => handleVenueSearch(query));

    let userLoading = $state(false);
    async function handleUserSearch(query: string) {
        if (userLoading && query.length > 3) return;
        userLoading = true;
        await rolleApi.search
            .users(query)
            .then(searchUsersResultStore.set)
            .finally(() => (userLoading = false));
        emitMixpanelEventDebounced(query);
    }
    const handleUserSearchDebounced = debounce(1000, (query: string) => handleUserSearch(query));

    let listLoading = $state(false);
    async function handleListSearch(query: string) {
        if (listLoading && query.length > 3) return;
        listLoading = true;
        await rolleApi.search
            .lists(query)
            .then((res) => searchListsResultStore.set(res.data))
            .finally(() => (listLoading = false));
        emitMixpanelEventDebounced(query);
    }
    const handleListSearchDebounced = debounce(1000, (query: string) => handleListSearch(query));

    function handleClearSearch(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        value.set("");
        searchInputElement?.focus();
    }

    function handleClearSearchResults(event: MouseEvent) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        value.set("");
        clearSearchResults();
    }

    function handleSuggestionClick(suggestion: string) {
        handleSearch(suggestion);
        searchInputElement?.blur();
    }

    /**
     * Search input placeholder animation.
     */
    let searchPlaceholder = $state("Procure por");
    const placeholderTextwritter = ["cafés", "música", "parques", "cerveja"];
    $effect(() => {
        let textIndex = 0;
        let wordIndex = 0;
        /* If the text should write or erase */
        let isWritting = true;
        let interval = setPausableInterval(() => {
            const word = placeholderTextwritter[textIndex];

            // Start erase
            if (wordIndex >= word.length && isWritting) {
                isWritting = false;
                interval.stop();
                setTimeout(interval.start, 2500);
                return;
            }

            // Next word
            if (wordIndex === 0 && !isWritting) {
                isWritting = true;
                if (textIndex >= placeholderTextwritter.length - 1) {
                    textIndex = 0;
                    return;
                }
                textIndex += 1;
                return;
            }

            if (isWritting) {
                wordIndex += 1;
            } else {
                wordIndex -= 1;
            }

            searchPlaceholder = `Procure por ${word.substring(0, wordIndex)}`;
        }, 75);
        interval.start();

        return () => {
            interval.stop();
        };
    });
</script>

{#snippet searchFieldIconRight(size: number)}
    {#if $value.length > 0}
        <button type="button" onclick={handleClearSearch}>
            <XCircle {size} />
        </button>
    {/if}
{/snippet}

<form onsubmit={handleFormSubmit} class="mt-2 w-full px-4">
    <div class="inline-flex w-full items-center gap-1">
        {#if !searchResultsEmpty}
            <button type="button" onclick={handleClearSearchResults}>
                <CaretLeft size={20} />
            </button>
        {/if}
        <Textfield
            name="query"
            placeholder={searchPlaceholder}
            field={searchFormStore.fields.query}
            iconRight={searchFieldIconRight}
            bind:inputElement={searchInputElement}
        />
    </div>
</form>

<!-- Lists -->
{#if $searchListsResultStore.length > 0 || listLoading}
    <div class="mt-4">
        <span class="px-4 text-sm">Listas</span>
        {#if listLoading}
            <div class="mt-4 grid place-items-center">
                <SpinnerGap size={20} class="animate-spin" />
            </div>
        {:else}
            <HorizontalScroll class="mt-2 inline-flex gap-2 px-4">
                {#each $searchListsResultStore as list (list.id)}
                    <ListCard {list} mixpanel={data.mixpanel} />
                {/each}
            </HorizontalScroll>
        {/if}
    </div>
{/if}

<!-- Venues -->
{#if $searchVenuesResultStore.length > 0 || venueLoading}
    <div class="mt-4">
        <span class="px-4 text-sm">Salvos na rolle</span>
        {#if venueLoading}
            <div class="mt-4 grid place-items-center">
                <SpinnerGap size={20} class="animate-spin" />
            </div>
        {:else}
            <!-- class="mt-2 flex flex-col gap-2" -->
            <HorizontalScroll class="mt-2 inline-flex gap-2 px-4">
                {#each $searchVenuesResultStore as venue (venue.id)}
                    <div
                        class={[
                            "shrink-0",
                            {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                "w-full": $searchVenuesResultStore.length === 1,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                "w-[90%]": $searchVenuesResultStore.length > 1,
                            },
                        ]}
                    >
                        <VenueRow {venue} mixpanel={data.mixpanel} />
                    </div>
                {/each}
            </HorizontalScroll>
        {/if}
    </div>
{/if}

<!-- Places -->
{#if $searchPlacesResultStore.length > 0 || placeLoading}
    <div class="mt-4 px-4">
        <span class="text-sm">Mais resultados</span>
        {#if placeLoading}
            <div class="mt-4 grid place-items-center">
                <SpinnerGap size={20} class="animate-spin" />
            </div>
        {:else}
            <div class="mt-2 flex flex-col gap-2">
                {#each $searchPlacesResultStore as business (business.googleId)}
                    <BusinessRow {business} mixpanel={data.mixpanel} />
                {/each}
            </div>
        {/if}
    </div>
{/if}

<!-- Users -->
{#if $searchUsersResultStore.length > 0 || userLoading}
    <div class="mt-4 px-4">
        <span class="text-sm">Usuários</span>
        {#if userLoading}
            <div class="mt-4 grid place-items-center">
                <SpinnerGap size={20} class="animate-spin" />
            </div>
        {:else}
            <div class="mt-2 flex flex-col gap-2">
                {#each $searchUsersResultStore as user (user.id)}
                    <UserRow {user} />
                {/each}
            </div>
        {/if}
    </div>
{/if}

{#if searchResultsEmpty}
    <!-- Search suggestions -->
    <div class="mt-4 w-full px-4">
        <div class="text-secondary-text text-xs">Sugestões de busca</div>
        <div class="mt-2 inline-flex w-full flex-wrap gap-2">
            {#each searchSuggestions as suggestion}
                <button
                    type="button"
                    onmousedown={(e: MouseEvent) => {
                        e.preventDefault();
                    }}
                    onclick={() => handleSuggestionClick(suggestion)}
                    class="text-secondary-text fluffy inline-flex w-fit items-center gap-1 rounded-full px-3 py-2 text-sm"
                >
                    <Lightbulb />
                    {suggestion}
                </button>
            {/each}
        </div>
    </div>

    <!-- Search history -->
    {#if $searchHistoryStore.length > 0}
        <div class="mt-4 px-4">
            <div class="text-secondary-text text-xs">Ultimas buscas</div>
            <div class="mt-2 flex flex-col gap-1">
                {#each $searchHistoryStore as history}
                    <button
                        type="button"
                        onmousedown={(e: MouseEvent) => {
                            e.preventDefault();
                        }}
                        onclick={() => handleSuggestionClick(history)}
                        class="text-secondary-text inline-flex items-center gap-1 py-1 text-sm"
                    >
                        <ArrowCounterClockwise />
                        {history}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
{/if}

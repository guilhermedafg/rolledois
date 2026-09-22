<script lang="ts">
    import { RecordId } from "surrealdb";
    import { untrack } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { rolleApi } from "@rolle/api";
    import {
        Button,
        HorizontalScroll,
        idFromRecordId,
        VENUE_CATEGORIES,
        VenueCategoryTag,
        type VenueCategoryMapped,
    } from "@rolle/ui";
    import { userStore } from "$lib/store";
    import { toggleSigninModal } from "$lib/modals";
    import { createPaginationState, handleUserShare } from "$lib/helpers";
    import { VenueRow, ListCard } from "$lib/containers";
    import { ExportIcon, GearIcon, GlobeIcon, SpinnerGapIcon } from "phosphor-svelte";

    import type { Venue } from "@rolle/types";

    let { data } = $props();
    const venuesCities = $derived(() => {
        return [...data.user.meta.venuesBookmarkedCities].sort((a, b) => {
            if (a.count < b.count) return 1;
            if (a.count > b.count) return -1;
            return 0;
        });
    });

    /**
     * Filters
     */
    let selectedCity: string | undefined = $state(undefined);
    let selectedCategories: string[] = $state([]);

    /**
     * Venues
     */
    let venueSentinel: HTMLDivElement | undefined = $state(undefined);
    const venues = createPaginationState(
        {
            data: (() => data)().initialState,
            meta: {
                page: 0,
                limit: 10,
                total: 100,
                categories: [],
            },
        },
        (page: number) =>
            rolleApi.user.getVenueBookmarksByNickname(
                data.user.nickname,
                data.geo,
                {
                    page,
                    limit: 10,
                },
                {
                    city: selectedCity,
                    categories: selectedCategories,
                },
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

    /**
     * Lists
     */
    const lists = createPaginationState(
        {
            data: (() => data)().initialState,
            meta: {
                page: 0,
                limit: 10,
                total: 100,
            },
        },
        (page: number) =>
            rolleApi.list.getManyByUserNickname(data.user.nickname, { page, limit: 10 }),
    );

    const privateLists = createPaginationState(
        {
            data: (() => data)().initialState,
            meta: {
                page: 0,
                limit: 10,
                total: 100,
            },
        },
        (page: number) => rolleApi.list.getManyPrivate({ page, limit: 10 }),
    );

    const bookmarkedLists = createPaginationState(
        {
            data: (() => data)().initialState,
            meta: {
                page: 0,
                limit: 10,
                total: 100,
            },
        },
        (page: number) =>
            rolleApi.user.getListBookmarksByNickname(data.user.nickname, { page, limit: 10 }),
    );
    let listsWrapper: HTMLDivElement | undefined = $state(undefined);
    let listsSentinel: HTMLDivElement | undefined = $state(undefined);
    let privateListsSentinel: HTMLDivElement | undefined = $state(undefined);
    let bookmarkedListsSentinel: HTMLDivElement | undefined = $state(undefined);

    $effect(() => {
        if (!listsWrapper || !listsSentinel) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) lists.nextPage();
            },
            {
                root: listsWrapper,
                rootMargin: "200px",
                threshold: 0,
            },
        );

        io.observe(listsSentinel);
        return () => io.disconnect();
    });

    $effect(() => {
        if (!listsWrapper || !privateListsSentinel) return;
        if (typeof $userStore === "undefined") return;
        if ($userStore.id !== data.user.id) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) privateLists.nextPage();
            },
            {
                root: listsWrapper,
                rootMargin: "200px",
                threshold: 0,
            },
        );

        io.observe(privateListsSentinel);
        return () => io.disconnect();
    });

    $effect(() => {
        if (!listsWrapper || !bookmarkedListsSentinel) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) bookmarkedLists.nextPage();
            },
            {
                root: listsWrapper,
                rootMargin: "200px",
                threshold: 0,
            },
        );

        io.observe(bookmarkedListsSentinel);
        return () => io.disconnect();
    });

    $effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        data.user.nickname;
        untrack(() => {
            venues.refetch();
            lists.refetch();
            bookmarkedLists.refetch();

            if (typeof $userStore === "undefined") return;
            if ($userStore.id !== data.user.id) return;
            privateLists.refetch();
        });
    });

    const userUrl = $derived(
        process.env.NODE_ENV === "development"
            ? `http://localhost:5173/u/${data.user.nickname}`
            : `https://rolle.com.br/u/${data.user.nickname}`,
    );
    const shareDescription = $derived(() => {
        let citiesText = "";

        switch (venuesCities().length) {
            case 0: {
                break;
            }
            case 1: {
                citiesText = venuesCities()[0].city;
                break;
            }
            case 2: {
                citiesText = venuesCities()
                    .map((v) => v.city)
                    .join(" e ");
                break;
            }
            default: {
                citiesText = venuesCities()
                    .slice(0, 2)
                    .map((v) => v.city)
                    .join(", ");
                citiesText += " e mais";
                break;
            }
        }

        if (data.user.bio.long.length === 0)
            return `Descubra os rolles que @${data.user.nickname} mais curte • ${citiesText}`;
        return `${data.user.bio.long} • ${citiesText}`;
    });

    /**
     * Category filter
     */
    let venueCategories = $state<Array<RecordId<"venueCategory">>>(
        (() => data)().user.meta.venuesBookmarkedCategories!.sort(venueCategoriesSort),
    );
    $effect(() => {
        venueCategories = data.user.meta.venuesBookmarkedCategories!.sort(venueCategoriesSort);
    });

    let venueCategoriesLoading = $state(false);
    async function updateVenueCategories() {
        venueCategoriesLoading = true;
        const response = await rolleApi.user
            .getVenueBookmarksByNickname(
                data.user.nickname,
                data.geo,
                {
                    page: 1,
                    limit: 1,
                },
                {
                    city: selectedCity,
                },
            )
            .finally(() => (venueCategoriesLoading = false));
        venueCategories = response.meta.categories.sort(venueCategoriesSort);
    }

    function venueCategoriesSort(a: Venue["category"], b: Venue["category"]) {
        const aMapped = VENUE_CATEGORIES.includes(idFromRecordId(a) as VenueCategoryMapped);
        const bMapped = VENUE_CATEGORIES.includes(idFromRecordId(b) as VenueCategoryMapped);
        if (aMapped && bMapped) return 0;
        if (!aMapped && !bMapped) return 0;
        if (aMapped && !bMapped) return -1;
        if (!aMapped && bMapped) return 1;
        return 0;
    }

    function handleCityClick(cityName: string | undefined) {
        selectedCategories = [];
        if (typeof cityName === "undefined" || selectedCity === cityName) {
            selectedCity = undefined;
            venues.refetch();
            updateVenueCategories();
            return;
        }

        data.mixpanel.track("click_user_cities_filter", { user_id: data.user.id, selectedCity });
        selectedCity = cityName;
        venues.refetch();
        updateVenueCategories();
    }

    function handleVenueCategoryFilterClick(categoryId: RecordId<"venueCategory"> | "all") {
        if (venues.loading) return;

        if (categoryId === "all") {
            selectedCategories = [];
            venues.refetch();
            return;
        }

        const categoryIdString = categoryId.toString();

        if (selectedCategories.includes(categoryIdString)) {
            selectedCategories = selectedCategories.filter((e) => e !== categoryIdString);
            data.mixpanel.track("click_user_venues_filter", {
                user_id: data.user.id,
                selectedCategories,
            });
            venues.refetch();
            return;
        }

        selectedCategories = [...selectedCategories, categoryIdString];
        data.mixpanel.track("click_user_venues_filter", {
            user_id: data.user.id,
            selectedCategories,
        });
        venues.refetch();
    }
</script>

<svelte:head>
    <title>rolles do @{data.user.nickname} • descubra novos lugares</title>
    <meta name="description" content={shareDescription()} />

    <meta property="og:type" content="website" />
    <meta
        property="og:title"
        content={`Os rolles de @${data.user.nickname} • descubra novos lugares`}
    />
    <meta property="og:description" content={shareDescription()} />
    <meta property="og:url" content={userUrl} />
    <meta property="og:image" content={data.user.pictureUrl} />
    <meta property="og:site_name" content="Rolle" />
    <meta property="og:locale" content="pt_BR" />

    <!-- 3) Twitter Cards (twitter:*) -->
    <meta name="twitter:card" content={data.user.pictureUrl} />
    <meta name="twitter:site" content="@rolle" />
    <meta
        name="twitter:title"
        content={`Os rolles de @${data.user.nickname} • descubra novos lugares`}
    />
    <meta name="twitter:description" content={shareDescription()} />
    <meta name="twitter:image" content={data.user.pictureUrl} />

    <link rel="canonical" href={userUrl} />
</svelte:head>

<div class="flex flex-col gap-6 p-8">
    <!-- User picture / name -->
    <div class="inline-flex items-stretch gap-4">
        <img
            src={data.user.pictureUrl}
            alt="Profile"
            class="size-14 shrink-0 rounded-full bg-gray-200 object-cover"
        />
        <div class="flex flex-1 flex-col justify-between">
            <div class="line-clamp-1 text-2xl font-bold">
                {data.user.name.full}
            </div>
            <div class="text-secondary-text">
                @{data.user.nickname}
            </div>
        </div>
        <div class="grid place-items-center">
            <Button variation="ghost" onclick={() => handleUserShare(data.mixpanel, data.user)}>
                <div class="border-text rounded-lg border p-1.5">
                    <ExportIcon size={24} />
                </div>
            </Button>
        </div>
    </div>

    <!-- divisor -->
    <div class="bg-text h-px"></div>

    <!-- Stats -->
    <div class="inline-flex items-stretch justify-between gap-4">
        <div class="user-socials-info">
            <span class="text-lg font-bold">{data.user.meta.totalVenuesBookmarked}</span>
            <span class="text-xs">Rolles</span>
        </div>

        <!-- divisor -->
        <div class="bg-border w-px shrink-0"></div>

        <a href="{page.url.pathname}/follows#followers" class="user-socials-info">
            <span class="text-lg font-bold">{data.user.followers.length}</span>
            <span class="text-xs">Seguidores</span>
        </a>

        <!-- divisor -->
        <div class="bg-border w-px shrink-0"></div>

        <a href="{page.url.pathname}/follows#following" class="user-socials-info">
            <span class="text-lg font-bold">{data.user.following.length}</span>
            <span class="text-xs">Seguindo</span>
        </a>

        <!-- divisor -->
        <div class="bg-border w-px shrink-0"></div>

        <!-- button -->
        {#if typeof $userStore !== "undefined" && $userStore.id !== data.user.id}
            {#if !$userStore.following.find((u) => u.id.toString() === data.user.id.toString())}
                <Button
                    stretch
                    outlined
                    textSize="sm"
                    variation="border"
                    onclick={() => userStore.follow(data.user.id.toString())}
                >
                    Seguir
                </Button>
            {:else}
                <Button
                    stretch
                    outlined
                    textSize="sm"
                    variation="border"
                    onclick={() => userStore.unfollow(data.user.id.toString())}>Seguindo</Button
                >
            {/if}
        {:else if typeof $userStore !== "undefined"}
            <Button
                stretch
                outlined
                textSize="sm"
                variation="border"
                onclick={() => goto("/profile/edit")}
            >
                <GearIcon size={20} />
                Editar
            </Button>
        {:else}
            <Button
                stretch
                outlined
                textSize="sm"
                variation="border"
                onclick={() => toggleSigninModal()}
            >
                Seguir
            </Button>
        {/if}
    </div>

    <!-- Description -->
    {#if typeof data.user.bio.long === "string" && data.user.bio.long.length > 0}
        <div class="text-sm">{data.user.bio.long}</div>
    {/if}
</div>

{#if data.user.meta.totalLists > 0}
    <div class="font-rounded px-4 text-xl font-bold">Listas</div>
    <HorizontalScroll
        bind:element={listsWrapper}
        class="mx-auto inline-flex items-stretch gap-2 p-4"
    >
        {#each privateLists.data as list (list.id)}
            <ListCard {list} mixpanel={data.mixpanel} />
        {/each}
        <div bind:this={privateListsSentinel} class="-ml-2"></div>
        {#if privateLists.loading}
            <div class="mt-4 grid place-items-center">
                <SpinnerGapIcon size={20} class="animate-spin" />
            </div>
        {/if}

        {#if lists.data.length > 0}
            {#each lists.data as list (list.id)}
                <ListCard {list} mixpanel={data.mixpanel} />
            {/each}
            <div bind:this={listsSentinel} class="-ml-2"></div>
            {#if lists.loading}
                <div class="mt-4 grid place-items-center">
                    <SpinnerGapIcon size={20} class="animate-spin" />
                </div>
            {/if}
        {/if}

        {#each bookmarkedLists.data as list (list.id)}
            <ListCard {list} mixpanel={data.mixpanel} />
        {/each}
        <div bind:this={bookmarkedListsSentinel} class="-ml-2"></div>
        {#if bookmarkedLists.loading && !lists.loading}
            <div class="mt-4 grid place-items-center">
                <SpinnerGapIcon size={20} class="animate-spin" />
            </div>
        {/if}
    </HorizontalScroll>
{/if}

{#if venues.data.length > 0}
    <!-- bookmarks by city -->
    <HorizontalScroll class="sticky top-0 z-1 inline-flex h-14 gap-2 bg-white px-4 py-3">
        <button
            onclick={() => handleCityClick(selectedCity)}
            class={[
                "bg-background inline-flex shrink-0 items-center gap-1 overflow-hidden rounded-lg border p-2 text-left text-xs transition-all cursor-pointer",
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "border-transparent": selectedCity !== undefined,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "bg-primary-400 border-text": selectedCity === undefined,

                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "shadow-text border-text -translate-y-0.5 shadow-[0_4px]":
                        selectedCity === undefined,
                },
            ]}
        >
            <GlobeIcon class="text-base" />
            Todos
        </button>
        {#each venuesCities() as cityObj (cityObj.city)}
            {@const active = selectedCity === cityObj.city}
            <button
                onclick={() => handleCityClick(cityObj.city)}
                class={[
                    "bg-background shrink-0 overflow-hidden rounded-lg border p-2 text-left text-xs transition-all cursor-pointer",
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "border-transparent": !active,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "bg-primary-400 border-text": active,

                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "shadow-text border-text -translate-y-0.5 shadow-[0_4px]": active,
                    },
                ]}
            >
                {cityObj.city}
            </button>
        {/each}
    </HorizontalScroll>
{/if}

{#if data.user.meta.totalVenuesBookmarked === 0}
    <div class="mt-4 px-4">O usuário ainda não possue nenhum rolle salvo.</div>
{:else}
    <!-- all bookmarks -->
    <div class="mt-3 flex flex-col">
        {#if selectedCity}
            <div class="font-rounded px-4 text-xl font-bold">
                Rolles de {selectedCity}
            </div>
        {:else}
            <div class="font-rounded px-4 text-xl font-bold">Todos os rolles</div>
        {/if}
        <!-- all categories -->
        {#if !venueCategoriesLoading}
            <HorizontalScroll class="sticky top-14 z-1 inline-flex gap-2 bg-white p-4">
                <button
                    class="cursor-pointer"
                    onclick={() => handleVenueCategoryFilterClick("all")}
                >
                    <VenueCategoryTag
                        active={selectedCategories.length === 0}
                        categoryId={new RecordId("venueCategory", "todos")}
                    />
                </button>
                {#each venueCategories as categoryId (categoryId)}
                    <button
                        class="cursor-pointer"
                        onclick={() => handleVenueCategoryFilterClick(categoryId)}
                    >
                        <VenueCategoryTag
                            active={selectedCategories.includes(categoryId.toString())}
                            {categoryId}
                        />
                    </button>
                {/each}
            </HorizontalScroll>
        {/if}
        {#if !venues.refetching}
            <!-- all venues -->
            <div class="flex w-full flex-col gap-3 px-4">
                {#each venues.data as venue (venue.id)}
                    <VenueRow {venue} mixpanel={data.mixpanel} />
                {/each}
            </div>
        {/if}
    </div>

    {#if venues.loading || venues.refetching}
        <div class="mt-4 grid place-items-center">
            <SpinnerGapIcon size={20} class="animate-spin" />
        </div>
    {/if}

    <div bind:this={venueSentinel}></div>
{/if}

<style lang="postcss">
    @reference "@rolle/config/style.css";

    .user-socials-info {
        @apply flex flex-1 flex-col items-center justify-center;
    }
</style>

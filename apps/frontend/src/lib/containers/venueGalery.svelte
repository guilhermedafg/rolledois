<script module lang="ts">
    const meterFormater = new Intl.NumberFormat("pt-br", {
        maximumFractionDigits: 0,
        style: "unit",
        unit: "meter",
        unitDisplay: "short",
    });
    const kilometerFormater = new Intl.NumberFormat("pt-br", {
        maximumFractionDigits: 1,
        style: "unit",
        unit: "kilometer",
        unitDisplay: "short",
    });
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { Button, HorizontalScroll } from "@rolle/ui";
    import { BookmarkIcon, SpinnerGapIcon } from "phosphor-svelte";

    import { page } from "$app/state";
    import { userStore } from "$lib/store";
    import { openAddVenueToListModal } from "$lib/modals";

    import type { Venue } from "@rolle/types";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        venue: Venue;
        mixpanel: Mixpanel;
    }

    const { venue, mixpanel }: Props = $props();
    const totalImages = $derived(venue.images.length);

    let loading = $state(false);
    let bookmarked = $derived(
        typeof $userStore !== "undefined" &&
            $userStore.bookmarks.venues.find((b) => b.googlePlaceId === venue.googlePlaceId),
    );

    let wrapperElement: HTMLDivElement | undefined = $state();
    let sliderElement: HTMLDivElement | undefined = $state();
    let sliderBarElement: HTMLDivElement | undefined = $state();
    let imagesElement: HTMLImageElement[] | undefined = $state([]);

    const sliderWidth = $derived(sliderElement?.getBoundingClientRect().width);
    const sliderBarWidth = $derived((sliderWidth || 0) / totalImages);

    onMount(() => {
        if (typeof wrapperElement === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const target = entry.target as HTMLImageElement;
                    const index = target.dataset.index;
                    sliderBarElement!.style.transform = `translateX(${Number(index) * sliderBarWidth}px)`;
                });
            },
            {
                root: wrapperElement,
                threshold: 0.5,
            },
        );
        imagesElement.forEach((img) => observer.observe(img));

        return () => {
            observer.disconnect();
        };
    });

    async function handleBookmarkClick(event: MouseEvent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (loading) return;
        if (bookmarked) return openAddVenueToListModal({ placeId: venue.googlePlaceId! });
        loading = true;
        mixpanel.track("bookmark", {
            from: page.url.pathname,
            placeId: venue.googlePlaceId,
        });
        await userStore.bookmarkVenue(venue.googlePlaceId!).finally(() => {
            loading = false;
        });
        openAddVenueToListModal({ placeId: venue.googlePlaceId! });
    }

    function handleLinkClick() {
        mixpanel.track("click_venue", {
            display_type: "galery",
            id: venue.id,
            name: venue.name,
        });
    }
</script>

<!-- TODO: click na esquerda volta foto, click na direita avanca foto -->
<div class="relative aspect-2/3 w-full overflow-hidden rounded-lg">
    <HorizontalScroll
        bind:element={wrapperElement}
        class="absolute top-0 left-0 inline-flex h-full snap-x snap-mandatory"
    >
        {#each venue.images as image, i (image.url)}
            <img
                loading="lazy"
                bind:this={imagesElement[i]}
                src={image.url}
                alt="{venue.name} cover"
                data-index={i}
                class="h-full w-full shrink-0 grow-0 snap-center object-cover"
            />
        {/each}
    </HorizontalScroll>

    <!-- "slider" -->
    <div
        bind:this={sliderElement}
        class="absolute top-4 right-4 left-4 h-0.5 rounded-lg bg-white shadow-md shadow-black/32"
    >
        <div
            bind:this={sliderBarElement}
            style="width: {sliderBarWidth}px;"
            class="absolute -top-1px left-0 h-1 rounded-full bg-white shadow-md shadow-black/32 transition-all"
        ></div>
    </div>

    <!-- info section -->
    <div class="absolute bottom-0 left-0 flex w-full flex-col gap-2 rounded-lg p-4">
        <a href="/venue/{venue.uri}" onclick={handleLinkClick}>
            <div
                class="mt-2 w-full rounded-lg bg-black/50 px-2 py-3 text-xs text-white backdrop-blur-xs"
            >
                <h6 class="truncate">{venue.name}</h6>
                {#if venue.meta?.distance}
                    <div class="font-rounded text-xs font-medium">
                        {#if venue.meta.distance > 1000}
                            {kilometerFormater.format(venue.meta.distance / 1000)}
                        {:else}
                            {meterFormater.format(venue.meta.distance)}
                        {/if}
                    </div>
                {/if}
                {#if typeof venue.description !== "undefined" && venue.description.length > 0}
                    <div class="mt-2 line-clamp-4 w-full">
                        {venue.description}
                    </div>
                {/if}
            </div>
        </a>

        <Button stretch onclick={handleBookmarkClick}>
            {#if loading}
                <SpinnerGapIcon class="animate-spin" /> Salvando
            {:else if bookmarked}
                <BookmarkIcon weight="fill" /> Salvo
            {:else}
                <BookmarkIcon /> Salvar
            {/if}
        </Button>
    </div>
</div>

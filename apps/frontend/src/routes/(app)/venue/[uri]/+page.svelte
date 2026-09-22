<script lang="ts">
    import { slide } from "svelte/transition";

    import {
        Button,
        Carousel,
        HorizontalScroll,
        idFromRecordId,
        VENUE_DAYS_OF_THE_WEEK_TO_TEXT,
        VenueCategoryTag,
        type DaysOfTheWeek,
    } from "@rolle/ui";
    import {
        ArrowBendUpRightIcon,
        CaretDownIcon,
        ExportIcon,
        GlobeIcon,
        InstagramLogoIcon,
        SparkleIcon,
        TiktokLogoIcon,
        XLogoIcon,
    } from "phosphor-svelte";
    import { getVenueStatus, shuffleArray } from "$lib/helpers";
    import { Bookmark, ListCard } from "$lib/containers";

    import type { Venue } from "@rolle/types";

    const { data } = $props();
    const venue = (() => data)().venue;
    const lists = (() => data)().lists;

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

    let imageCarouselOpen = $state(false);
    let imageCarouselIndex = $state(0);

    const hintsColors = ["#FEBA87", "#FFB6A9", "#9BC385", "#E2C7F1", "#B5D8DB"];
    const shuffledHintsColors = shuffleArray(hintsColors);

    const venueUrl =
        process.env.NODE_ENV === "development"
            ? `http://localhost:5173/venue/${venue.uri}`
            : `https://rolle.com.br/venue/${venue.uri}`;

    const daysOfTheWeek = Object.keys(VENUE_DAYS_OF_THE_WEEK_TO_TEXT) as DaysOfTheWeek[];
    const todayOfTheWeek = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase() as DaysOfTheWeek;
    const todayWorkingHours = venue.workingHours ? venue.workingHours[todayOfTheWeek] : undefined;
    let status = $derived(getVenueStatus(venue));

    let timetableOpen = $state(false);

    function isOpen() {
        if (typeof todayWorkingHours === "undefined") return false;

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        for (const workingHour of todayWorkingHours) {
            const [startHourText, startMinuteText] = workingHour.start.split(":");
            if (startHourText === "Aberto 24 horas") return true;
            const startHour = parseInt(startHourText, 10);
            const startMinute = parseInt(startMinuteText, 10);

            const [endHourText, endMinuteText] = workingHour.end.split(":");
            const endHour = parseInt(endHourText, 10);
            const endMinute = parseInt(endMinuteText, 10);

            if (hour > startHour && hour < endHour) {
                return true;
            } else if (hour === startHour && minute > startMinute) {
                return true;
            } else if (hour === endHour && minute < endMinute) {
                return true;
            }
        }

        return false;
    }

    function handleDirectionClick() {
        data.mixpanel.track("click_venue_directions", {
            id: venue.id,
            name: venue.name,
        });
        window.open(
            ` https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name)}&query_place_id=${venue.googlePlaceId}`,
        );
    }

    function handleWebsiteClick() {
        data.mixpanel.track("click_venue_website", {
            id: venue.id,
            name: venue.name,
        });
        window.open(venue.website!);
    }

    function handleSocialClick(social: keyof Venue["socials"]) {
        data.mixpanel.track("click_venue_socials", {
            id: venue.id,
            name: venue.name,
            social: { [social]: venue.socials[social] },
        });
        window.open(venue.socials[social]);
    }

    async function handleShare(_: MouseEvent) {
        data.mixpanel.track("click_venue_share", { id: venue.id, name: venue.name });

        const hasClipboard =
            typeof navigator.clipboard !== "undefined" &&
            typeof navigator.clipboard.writeText !== "undefined";

        if (!navigator.share && !hasClipboard) return;
        if (!navigator.share && hasClipboard) {
            await navigator.clipboard.writeText(venueUrl);
            return;
        }

        try {
            await navigator.share({
                title: `Rolle - ${venue.name}`,
                text: venue.description,
                url: venueUrl,
            });
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                await navigator.clipboard.writeText(venueUrl);
            }
        }
    }

    function handleImageClick(index: number) {
        imageCarouselIndex = index;
        imageCarouselOpen = true;
    }
</script>

<svelte:head>
    <title>{venue.name} • {idFromRecordId(venue.category)} na rolle</title>
    <meta name="description" content={venue.description} />

    <meta property="og:type" content="website" />
    <meta
        property="og:title"
        content={`${venue.name} • ${idFromRecordId(venue.category)} na rolle`}
    />
    <meta property="og:description" content={venue.description} />
    <meta property="og:url" content={venueUrl} />
    <meta property="og:image" content={venue.cover.thumbUrl} />
    <meta property="og:site_name" content="Rolle" />
    <meta property="og:locale" content="pt_BR" />

    <!-- Twitter Cards (twitter:*) -->
    <meta name="twitter:card" content={venue.cover.url} />
    <meta name="twitter:site" content="@rolle" />
    <meta
        name="twitter:title"
        content={`${venue.name} • ${idFromRecordId(venue.category)} na rolle`}
    />
    <meta name="twitter:description" content={venue.description} />
    <meta name="twitter:image" content={venue.cover.url} />

    <link rel="canonical" href={venueUrl} />
</svelte:head>

<HorizontalScroll class="mt-2 inline-flex flex-wrap gap-2 px-4 py-2">
    {#if venue.geo}
        <Button outlined variation="ghost" onclick={handleDirectionClick}>
            <ArrowBendUpRightIcon />
            Ir
        </Button>
    {/if}
    {#if typeof venue.website !== "undefined"}
        <Button outlined variation="ghost" onclick={handleWebsiteClick}>
            <GlobeIcon />
            Site
        </Button>
    {/if}
    {#if typeof venue.socials.instagram !== "undefined"}
        <Button outlined variation="ghost" onclick={() => handleSocialClick("instagram")}>
            <InstagramLogoIcon />
        </Button>
    {/if}
    {#if typeof venue.socials.tiktok !== "undefined"}
        <Button outlined variation="ghost" onclick={() => handleSocialClick("tiktok")}>
            <TiktokLogoIcon />
        </Button>
    {/if}
    {#if typeof venue.socials.x !== "undefined"}
        <Button outlined variation="ghost" onclick={() => handleSocialClick("x")}>
            <XLogoIcon />
        </Button>
    {/if}

    <div class="inline-flex flex-1 justify-end gap-2">
        <Button outlined variation="ghost" onclick={handleShare}>
            <ExportIcon size={20} />
        </Button>
        <Bookmark variant="large" placeId={venue.googlePlaceId!} mixpanel={data.mixpanel} />
    </div>
</HorizontalScroll>

<div class="mt-4 px-4">
    <h6 class="w-full">{venue.name}</h6>
</div>

<div class="mt-3 inline-flex items-center gap-1 px-4">
    <a href={`/category/${venue.category.toString().split(":")[1]}`}>
        <VenueCategoryTag categoryId={venue.category} />
    </a>
    {#if venue.meta?.distance}
        <div class="text-secondary-text text-xs font-bold">
            {#if venue.meta.distance > 1000}
                • {kilometerFormater.format(venue.meta.distance / 1000)}
            {:else}
                • {meterFormater.format(venue.meta.distance)}
            {/if}
        </div>
    {/if}
</div>

{#if typeof venue.description !== "undefined"}
    <div class="mt-3 px-4 text-sm">
        {venue.description}
    </div>
{/if}

<div class="text-secondary-text mt-6 px-4 text-sm underline underline-offset-2 select-all">
    {venue.address?.full}
</div>

<!-- hours info -->
<div class="mt-6 flex w-full flex-col gap-1.5 px-4">
    {#if typeof venue.workingHours !== "undefined"}
        <button
            class="inline-flex items-center gap-1 text-xs"
            onclick={() => (timetableOpen = !timetableOpen)}
        >
            {#if status?.status}
                <span class="text-success font-bold">Aberto</span>
            {:else}
                <span class="text-error font-bold">Fechado</span>
            {/if}
            {#if typeof todayWorkingHours !== "undefined" && isOpen() && !timetableOpen}
                <span transition:slide={{ axis: "x" }} class="whitespace-nowrap">
                    {#if status?.status === true && status.nextClose[0] === "Aberto 24 horas"}
                        24 horas
                    {:else}
                        fecha às
                        {todayWorkingHours[0].end}
                    {/if}
                </span>
            {/if}
            <CaretDownIcon class={`transition-all ${timetableOpen ? "rotate-180" : ""}`} />
        </button>
    {/if}
</div>

{#if typeof venue.workingHours !== "undefined"}
    {#if timetableOpen}
        <div transition:slide class="grid grid-cols-2 px-4 text-sm">
            {#each daysOfTheWeek as dayOfTheWeek}
                {#if venue.workingHours[dayOfTheWeek]}
                    <label
                        for={`working-hours-${dayOfTheWeek}`}
                        class:font-bold={dayOfTheWeek === todayOfTheWeek}
                    >
                        {VENUE_DAYS_OF_THE_WEEK_TO_TEXT[dayOfTheWeek]}:
                    </label>
                    <span
                        id={`working-hours-${dayOfTheWeek}`}
                        class:font-bold={dayOfTheWeek === todayOfTheWeek}
                    >
                        {venue.workingHours[dayOfTheWeek][0].start}
                        {venue.workingHours[dayOfTheWeek][0].end.length > 0 ? "-" : ""}
                        {venue.workingHours[dayOfTheWeek][0].end}
                    </span>
                {:else}
                    <label
                        for={`working-hours-${dayOfTheWeek}`}
                        class:font-bold={dayOfTheWeek === todayOfTheWeek}
                    >
                        {VENUE_DAYS_OF_THE_WEEK_TO_TEXT[dayOfTheWeek]}:
                    </label>
                    <span
                        id={`working-hours-${dayOfTheWeek}`}
                        class:font-bold={dayOfTheWeek === todayOfTheWeek}
                    >
                        Fechado
                    </span>
                {/if}
            {/each}
        </div>
    {/if}
{/if}

<!-- Images -->
<HorizontalScroll class="mt-6 grid h-72 w-fit! max-w-full grid-flow-col grid-rows-2 gap-2 px-4">
    {#each venue.images as image, index}
        <button
            type="button"
            onclick={() => handleImageClick(index)}
            class={[
                "aspect-2/3 h-full cursor-pointer",
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "col-span-2 row-span-2": index === 0,
                },
            ]}
        >
            <img src={image.url} alt="Ambiente" class="size-full rounded-lg object-cover" />
        </button>
    {/each}
</HorizontalScroll>

<!-- Hints -->
{#if venue.hints.length > 0}
    <h6 class="mt-6 px-4">Dicas rápidas antes de ir:</h6>
    <div class="mt-4 px-4">
        <div class="border-text flex w-full flex-col gap-4 rounded-lg border p-4">
            {#each venue.hints as hint, index}
                {@const bgColor = shuffledHintsColors[index]}
                {@const iconSize = 24}

                <div class="inline-flex items-center gap-4 text-sm">
                    <div
                        class="border-border bg-border/40 rounded-lg border p-2"
                        style="background-color: {bgColor}20; border-color: {bgColor}"
                    >
                        <SparkleIcon size={iconSize} color={bgColor} />
                    </div>
                    {hint}
                </div>

                <!-- divisor -->
                {#if index < venue.hints.length - 1}
                    <div class="bg-border h-px"></div>
                {/if}
            {/each}
        </div>
    </div>
{/if}

<!-- Also in lists -->
{#if lists.length > 0}
    <h6 class="mt-6 px-4">Também em outras listas:</h6>
    <HorizontalScroll class="mt-3 inline-flex w-full gap-2 px-4">
        {#each lists as list (list.id)}
            <div>
                <ListCard {list} mixpanel={data.mixpanel} />
            </div>
        {/each}
    </HorizontalScroll>
{/if}

<Carousel
    open={imageCarouselOpen}
    bind:index={imageCarouselIndex}
    images={venue.images.map((i) => i.url)}
    onBackdropClick={() => (imageCarouselOpen = false)}
    onClose={() => (imageCarouselOpen = false)}
/>

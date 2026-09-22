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
    import { goto } from "$app/navigation";
    import { VENUE_DAYS_OF_THE_WEEK_TO_TEXT, VenueCategoryTag } from "@rolle/ui";
    import { Bookmark } from "$lib/containers";
    import { getVenueStatus } from "../helpers/venue";

    import type { User, Venue } from "@rolle/types";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        venue: Venue;
        mixpanel: Mixpanel;
        listOwner?: User;
        comment?: string;
        active?: boolean;
        /* If on click, should go to venue's page. */
        href?: boolean;
        onclick?: (venue: Venue) => void | Promise<void>;
    }

    const {
        venue,
        listOwner,
        mixpanel,
        comment,
        active = false,
        href = true,
        onclick = () => {},
    }: Props = $props();
    const status = getVenueStatus((() => venue)());

    async function handleClick() {
        mixpanel.track("click_venue", {
            display_type: "row",
            id: venue.id,
            name: venue.name,
        });
        if (href) goto(`/venue/${venue.uri}`);
        await onclick(venue);
    }
</script>

<div
    class={[
        "border-text flex w-full flex-col gap-4 rounded-lg border p-4 text-left transition-all cursor-pointer",
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "shadow-text -translate-y-0.5 shadow-[0_4px]": active,
        },
    ]}
>
    <div class="inline-flex cursor-pointer">
        <button onclick={handleClick} class="inline-flex flex-1 gap-4 text-left cursor-pointer">
            <img
                src={venue.images[0]?.thumbUrl || "https://picsum.photos/600/800"}
                loading="lazy"
                alt="Estabelecimento"
                class="aspect-2/3 w-24 rounded-lg object-cover"
            />
            <!-- Card -->
            <div class="relative flex w-full flex-col">
                <!-- Header -->
                <div class="inline-flex w-full justify-between">
                    <div class="font-rounded line-clamp-2 w-full pr-1 text-sm font-semibold">
                        {venue.name}
                    </div>
                    <!-- <Bookmark placeId={venue.googlePlaceId!} {mixpanel} /> -->
                </div>
                <!-- Sub header -->
                <div class="mt-1 inline-flex items-center gap-1">
                    <VenueCategoryTag categoryId={venue.category} />

                    {#if venue.meta?.distance}
                        <div class="font-rounded text-secondary-text text-xs font-medium">
                            {#if venue.meta.distance > 1000}
                                • {kilometerFormater.format(venue.meta.distance / 1000)}
                            {:else}
                                • {meterFormater.format(venue.meta.distance)}
                            {/if}
                        </div>
                    {/if}
                </div>

                {#if typeof status !== "undefined"}
                    <div class="text-secondary-text mt-2 text-xs">
                        {#if status.status}
                            {@const [hour, minute] = status.nextClose}
                            <span class="text-success">Aberto</span>

                            {#if typeof hour === "number" && typeof minute === "number"}
                                • até às
                                {hour.toString().padStart(2, "0")}:{minute
                                    .toString()
                                    .padStart(2, "0")}
                            {:else}
                                • 24 horas
                            {/if}
                        {:else if typeof status.nextOpen[0] === "string"}
                            <span class="text-error">Fechado</span>
                            • abre {VENUE_DAYS_OF_THE_WEEK_TO_TEXT[
                                status.nextOpen[0]
                            ].toLowerCase()}
                        {:else if typeof status.nextOpen[0] === "number" && typeof status.nextOpen[1] === "number"}
                            {@const [hour, minute] = status.nextOpen}
                            <span class="text-error">Fechado</span>
                            • abre às
                            {hour.toString().padStart(2, "0")}:{minute.toString().padStart(2, "0")}
                        {/if}
                    </div>
                {/if}

                <!-- Address -->
                <div class="text-secondary-text absolute bottom-0 left-0 text-xs">
                    <span class="capitalize">{venue.address?.city.fullName}</span> -
                    <span class="capitalize">{venue.address?.district}</span>
                </div>
            </div>
        </button>
        <Bookmark placeId={venue.googlePlaceId!} {mixpanel} />
    </div>

    {#if typeof comment !== "undefined"}
        <!-- divisor -->
        <div class="bg-border mt-2 h-px"></div>
        <div class="inline-flex gap-2">
            <div>
                {#if typeof listOwner !== "undefined"}
                    <img
                        src={listOwner.pictureUrl}
                        alt="Dono da lista"
                        class="size-8 shrink-0 grow-0 rounded-full object-cover"
                    />
                {/if}
            </div>
            <div class="flex flex-1 flex-col">
                {#if typeof listOwner !== "undefined"}
                    <div class="text-xs font-medium">
                        @{listOwner.nickname}
                    </div>
                {/if}
                <div class="w-full text-left text-xs whitespace-pre-wrap">
                    “{comment}”
                </div>
            </div>
        </div>
    {/if}
</div>

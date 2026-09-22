<script lang="ts">
    import { mapZoomStore } from "$lib/store";
    import {
        idFromRecordId,
        VENUE_CATEGORY_TO_COLOR,
        VENUE_CATEGORY_TO_ICON,
        type VenueCategoryMapped,
    } from "@rolle/ui";
    import type { Venue } from "@rolle/types";

    interface Props {
        venue: Venue;
        click: (venue: Venue) => void;
    }

    const { venue, click }: Props = $props();
    const category = idFromRecordId((() => venue)().category) as VenueCategoryMapped;

    const Icon = VENUE_CATEGORY_TO_ICON[category] || VENUE_CATEGORY_TO_ICON["default"];
    const color = VENUE_CATEGORY_TO_COLOR[category] || VENUE_CATEGORY_TO_COLOR["default"];

    function handleClick() {
        click(venue);
    }
</script>

<button
    type="button"
    onclick={handleClick}
    class="relative inline-flex items-center justify-start gap-1"
>
    <div
        class="marker grid size-8 place-items-center rounded-full"
        style="background-color: {color};"
    >
        <Icon size={16} />
    </div>
    {#if $mapZoomStore >= 15}
        <div class="text-2xs absolute left-9 w-20 text-left leading-2.5 font-bold">
            {venue.name}
        </div>
    {/if}
</button>

<style>
    .marker {
        box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.4),
            inset 0 -4px 4px rgba(0, 0, 0, 0.4);
    }
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { rolleApi } from "@rolle/api";
    import { calcDistance } from "@rolle/geo";
    import {
        VENUE_CATEGORY_TO_COLOR,
        VENUE_CATEGORY_TO_ICON,
        type VenueCategoryMapped,
    } from "@rolle/ui";

    import { Bookmark } from "$lib/containers";
    import { toggleSigninModal } from "$lib/modals";
    import { userStore, currentPositionStore, gotPositionStore } from "$lib/store";

    import type { BusinessInfo } from "@rolle/api_places";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        business: BusinessInfo;
        mixpanel: Mixpanel;
    }
    const { business, mixpanel }: Props = $props();

    let savingVenue = $state(false);

    let tempCategory = (() => business)().type.toLowerCase();
    if (tempCategory.startsWith("loja de ")) {
        tempCategory = tempCategory.substring(7).trim();
    }
    if (tempCategory.startsWith("artigos de ")) {
        tempCategory = tempCategory.substring(10).trim();
    }
    const category = removeAccents(
        tempCategory.trim().split(" ")[0].toLowerCase(),
    ) as VenueCategoryMapped;

    const CategoryIcon = VENUE_CATEGORY_TO_ICON[category] ?? VENUE_CATEGORY_TO_ICON["default"];
    const categoryColor = VENUE_CATEGORY_TO_COLOR[category] ?? VENUE_CATEGORY_TO_COLOR["default"];

    function removeAccents(str: string) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    async function handleClick(event: MouseEvent) {
        event.preventDefault();

        if (savingVenue) {
            return;
        }

        if (typeof $userStore === "undefined") {
            toggleSigninModal({
                title: "Crie uma conta para salvar esse Rolle!",
                subtitle: "Não perca o timing do Rolle — descubra lugares que valem a pena.",
            });
            return;
        }

        savingVenue = true;
        const venue = await rolleApi.venue
            .getByGooglePlaceId(business.placeId)
            .finally(() => (savingVenue = false));
        await goto(`/venue/${venue.uri}`);
    }
</script>

<a href="#hidden" class="inline-flex items-center justify-center gap-4" onclick={handleClick}>
    <div class="flex flex-col items-center">
        <div
            class="flex size-9 items-center justify-center rounded-lg"
            style={`background-color: ${categoryColor};`}
        >
            <CategoryIcon class="text-xl" />
        </div>
        {#if $gotPositionStore}
            <span class="text-text text-2xs">
                {calcDistance($currentPositionStore, {
                    latitude: business.latitude,
                    longitude: business.longitude,
                }).toFixed(1)}km
            </span>
        {/if}
    </div>
    <div class="flex w-full flex-col gap-1 overflow-hidden">
        <div class="font-rounded w-full truncate">{business.name}</div>
        <div class="text-secondary-text w-full truncate text-xs">
            {business.address}
        </div>
    </div>
    <Bookmark placeId={business.placeId!} {mixpanel} />
</a>

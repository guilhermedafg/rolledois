<script lang="ts">
    import { goto } from "$app/navigation";
    import type { User } from "@rolle/types";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        user: User;
        mixpanel: Mixpanel;
    }
    const { user, mixpanel }: Props = $props();

    const citiesArr = (() => user)().meta.venuesBookmarkedCities;

    function handleSeeProfile() {
        mixpanel.track("click_curator", { name: user.nickname });
        goto(`/u/${user.nickname}`);
    }
</script>

<button type="button" class="bg-background flex flex-col rounded-lg p-2" onclick={handleSeeProfile}>
    <img
        src={user.pictureUrl}
        loading="lazy"
        alt="Curador {user.nickname}"
        class="aspect-square w-full rounded-lg object-cover"
    />
    <div class="mt-1 flex h-full w-full flex-col">
        <div class="flex w-full flex-col items-start">
            <div class="font-rounded text-lg font-semibold">{user.name.full}</div>
        </div>
        <div class="text-secondary-text mt-1 line-clamp-2 text-left text-xs">
            {user.meta.totalVenuesBookmarked} Rolle{user.meta.totalVenuesBookmarked !== 1
                ? "s"
                : ""}
            {user.meta.totalVenuesBookmarked > 0 ? "•" : ""}
            {#if citiesArr.length > 0}
                {citiesArr[0].city}
                {#if citiesArr.length > 1}
                    +{citiesArr.length - 1} cidade{citiesArr.length - 1 === 1 ? "" : "s"}
                {/if}
            {/if}
        </div>
    </div>
</button>

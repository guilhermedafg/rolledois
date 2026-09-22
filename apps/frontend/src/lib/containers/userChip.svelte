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

<button type="button" class="flex w-20 shrink-0 grow-0 flex-col" onclick={handleSeeProfile}>
    <img
        src={user.pictureUrl}
        loading="lazy"
        alt="Curador {user.nickname}"
        class="aspect-square w-20 rounded-lg object-cover"
    />
    <div class="mt-1 flex w-full flex-col items-start justify-start">
        <div class="w-full truncate text-left text-sm">@{user.nickname}</div>

        {#if citiesArr.length > 0}
            <div class="text-secondary-text text-2xs w-full truncate text-left">
                {citiesArr[0].city}
                {#if citiesArr.length > 1}
                    +{citiesArr.length - 1} cidade{citiesArr.length - 1 === 1 ? "" : "s"}
                {/if}
            </div>
        {/if}
        <div class="text-2xs text-left leading-2">
            {user.meta.totalVenuesBookmarked} rolle{user.meta.totalVenuesBookmarked !== 1
                ? "s"
                : ""}
        </div>
    </div>
</button>

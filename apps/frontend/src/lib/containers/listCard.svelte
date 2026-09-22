<script lang="ts">
    import { goto } from "$app/navigation";
    import { EyeSlashIcon } from "phosphor-svelte";
    import type { List } from "@rolle/types";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        list: List;
        mixpanel: Mixpanel;
    }

    const { list, mixpanel }: Props = $props();

    const listCitiesDisplay = $derived(() => {
        const listCities = list.meta.venuesCities;
        switch (listCities.length) {
            case 0: {
                return "";
            }
            case 1: {
                return listCities[0];
            }
            case 2: {
                return listCities.join(" e ");
            }
            default: {
                const last = listCities.at(-1);
                return `${listCities.join(", ")} e ${last}`;
            }
        }
    });

    const coverUrl = $derived(list.cover?.url || "https://picsum.photos/600/800");

    function handleClick() {
        mixpanel.track("click_list", { name: list.name });
        goto(`/list/${list.uri}`);
    }
</script>

<button
    type="button"
    onclick={handleClick}
    class="relative aspect-2/3 w-full max-w-40 min-w-36 overflow-hidden rounded-lg cursor-pointer"
>
    <img src={coverUrl} loading="lazy" alt="List cover" class="absolute inset-0 object-cover" />
    <div
        class="from-black-50 to-black-50 absolute inset-0 flex flex-col justify-between bg-linear-to-b via-black/0 px-2 py-3 text-white"
    >
        <div class="font-rounded line-clamp-6 w-full text-left font-bold">
            {#if list.private}
                <EyeSlashIcon size={16} />
            {/if}
            {list.name}
        </div>

        <div class="flex w-full grow-0 flex-col">
            <div class="inline-flex w-full items-baseline-last gap-1">
                <img
                    src={list.owner.pictureUrl}
                    loading="lazy"
                    alt="Criador da lista"
                    class="size-5 rounded-full"
                />
                <div class="flex w-full grow-0 flex-col justify-center">
                    <div class="text-2xs text-left leading-1">Feita por</div>
                    <div
                        class="font-rounded inline-flex w-full items-center gap-1 text-xs font-medium"
                    >
                        @{list.owner.nickname}
                    </div>
                </div>
            </div>

            <div class="text-2xs w-full truncate text-left">
                {list.meta.totalVenues} rolle{list.meta.totalVenues > 1 ? "s" : ""} • {listCitiesDisplay()}
            </div>
        </div>
    </div>
</button>

<script lang="ts">
    import { CheckCircleIcon } from "phosphor-svelte";

    import type { ListFull } from "@rolle/types";

    interface Props {
        list: ListFull;
        placeId: string;
        onclick: (venueOnList: boolean) => void;
    }

    const { list, placeId, onclick }: Props = $props();

    const venueOnList = $derived(
        list.venues.findIndex((v) => v.record.googlePlaceId === placeId) !== -1,
    );

    function handleClick() {
        onclick(venueOnList);
    }
</script>

<button
    type="button"
    onclick={handleClick}
    class="inline-flex items-center justify-between gap-2 px-4 cursor-pointer"
>
    <div class="inline-flex items-center gap-2">
        <img
            src={list.cover?.url || "https://picsum.photos/800/600"}
            alt="List cover"
            class="aspect-square w-10 shrink-0 grow-0 rounded-lg object-cover"
        />
        <div class="line-clamp-2 text-left text-lg">{list.name}</div>
    </div>
    <CheckCircleIcon
        size={24}
        class={`shrink-0 grow-0 transition-all ${venueOnList ? "fill-success" : "fill-secondary-text"}`}
    />
</button>

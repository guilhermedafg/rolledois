<script lang="ts">
    import { CaretLeftIcon } from "phosphor-svelte";
    import { ListCard } from "$lib/containers";

    const { data } = $props();
    const lists = (() => data)().lists.data;
</script>

<div class="p-4">
    <div class="inline-flex w-full items-center justify-between">
        <CaretLeftIcon size={24} onclick={() => window.history.back()} />
        <h6 class="font-medium">Listas em destaque ✨</h6>
        <div class="w-6"></div>
    </div>
    <div class="mx-auto mt-6 grid w-full grid-cols-2 items-center gap-2">
        {#each lists as list (list.id)}
            <ListCard {list} mixpanel={data.mixpanel} />
        {/each}
    </div>
</div>

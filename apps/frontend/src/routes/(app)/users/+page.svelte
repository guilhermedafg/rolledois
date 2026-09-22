<script lang="ts">
    import { UserCard } from "$lib/containers";
    import { CaretLeftIcon } from "phosphor-svelte";

    const { data } = $props();
    const users = (() => data)().suggestedUsers;
</script>

<div class="p-4">
    <div class="inline-flex w-full items-center justify-between">
        <CaretLeftIcon size={24} onclick={() => window.history.back()} />
        <h6 class="font-medium">Curadores selecionados</h6>
        <div class="w-6"></div>
    </div>
    <div class="mt-6 grid w-full gap-8">
        {#each users as user (user.id)}
            <UserCard {user} mixpanel={data.mixpanel} />
        {/each}
    </div>
</div>

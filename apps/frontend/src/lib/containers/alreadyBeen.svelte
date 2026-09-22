<script lang="ts">
    import { userStore } from "$lib/store";
    import { Check, Checks, SpinnerGap } from "phosphor-svelte";

    interface Props {
        placeId: string;
    }

    const { placeId }: Props = $props();
    let loading = $state(false);

    async function handleClick(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (loading) return;
        loading = true;
        await userStore.alreadyBeen(placeId).finally(() => {
            loading = false;
        });
    }
</script>

<button type="button" onclick={handleClick} class="item-center flex h-fit w-fit">
    {#if loading}
        <SpinnerGap class="animate-spin text-xl" />
    {:else if typeof $userStore !== "undefined" && $userStore.alreadyBeen.find((b) => b.googlePlaceId === placeId)}
        <Checks class="text-xl" />
    {:else}
        <Check class="text-xl" />
    {/if}
</button>

<script lang="ts">
    import { fly } from "svelte/transition";
    import { CaretLeftIcon, ExportIcon } from "phosphor-svelte";
    import { UserRow } from "$lib/containers";
    import { handleUserShare } from "$lib/helpers";
    import { page } from "$app/state";

    let { data } = $props();
    const following = (() => data)().user.following;
    const followers = (() => data)().user.followers;

    let tabIndex = $state(0);

    $effect(() => {
        switch (page.url.hash) {
            case "#followers": {
                tabIndex = 0;
                break;
            }
            case "#following": {
                tabIndex = 1;
                break;
            }
            default: {
                tabIndex = 0;
            }
        }
    });

    function handleGoBack() {
        window.history.back();
    }
</script>

<!-- top header -->
<div class="mt-2 inline-flex h-10 w-full items-center justify-between gap-2 px-4">
    <button onclick={handleGoBack}>
        <CaretLeftIcon size={24} />
    </button>
    <div class="font-rounded font-medium">
        @{data.user.nickname}
    </div>
    <ExportIcon size={24} onclick={() => handleUserShare(data.mixpanel, data.user)} />
</div>

<div class="relative inline-flex w-full">
    <a href="#followers" class="grid flex-1 place-items-center px-4 py-3">
        {data.user.followers.length} Seguidore{data.user.followers.length !== 1 ? "s" : ""}
    </a>
    <a href="#following" class="grid flex-1 place-items-center px-4 py-3">
        {data.user.following.length} Seguindo
    </a>
    <div
        class={[
            "absolute bottom-0 left-0 h-px w-1/2 bg-black/45 transition-all",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { "left-1/2": tabIndex === 1 },
        ]}
    ></div>
</div>

<div class="grid grid-cols-[1fr] grid-rows-[1fr]">
    {#if tabIndex === 0}
        <div
            class="col-1 row-1 mt-4 flex flex-col gap-3 px-4"
            transition:fly={{ opacity: 1, x: "-100%" }}
        >
            {#each followers as user (user.id)}
                <UserRow {user} />
            {/each}
        </div>
    {:else if tabIndex === 1}
        <div
            class="col-1 row-1 mt-4 flex flex-col gap-3 px-4"
            transition:fly={{ opacity: 1, x: "100%" }}
        >
            {#each following as user (user.id)}
                <UserRow {user} />
            {/each}
        </div>
    {/if}
</div>

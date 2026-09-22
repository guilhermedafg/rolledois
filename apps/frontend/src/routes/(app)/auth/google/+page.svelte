<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { SpinnerGap } from "phosphor-svelte";

    import { rolleApi } from "@rolle/api";
    import { userStore } from "$lib/store";

    const { data } = $props();

    onMount(async () => {
        await rolleApi.auth.googleSign({ code: data.code });
        await userStore.refresh();
        await goto("/", { replaceState: true, invalidateAll: true });
    });
</script>

<div class="grid h-dvh w-full place-items-center">
    <SpinnerGap class="animate-spin text-xl" />
</div>

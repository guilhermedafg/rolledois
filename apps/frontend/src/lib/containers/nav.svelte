<script lang="ts">
    import { CaretLeftIcon, HouseIcon, UserIcon } from "phosphor-svelte";
    import { Logo } from "@rolle/ui";
    import { toggleSigninModal } from "$lib/modals";
    import { userStore } from "$lib/store";
    import { onNavigate } from "$app/navigation";

    const logged = $derived(typeof $userStore !== "undefined");

    let lastRoute: URL | undefined = $state();
    onNavigate((navigation) => {
        if (navigation.from?.url.toString() === navigation.to?.url.toString()) return;
        if (navigation.from?.url) {
            lastRoute = navigation.from.url;
        }
    });
</script>

<nav class="inline-flex w-full items-center justify-between border-b p-4">
    <div class="inline-flex items-center gap-2">
        {#if typeof lastRoute !== "undefined"}
            <button
                class="bg-border grid size-10 place-items-center rounded-full cursor-pointer"
                onclick={() => window.history.back()}
            >
                <CaretLeftIcon size={16} />
            </button>
        {/if}
        <Logo class="w-16" />
    </div>
    <div class="inline-flex gap-2">
        <a href="/">
            <div class="bg-border w-fit rounded-full p-2">
                <HouseIcon class="size-6" />
            </div>
        </a>
        {#if logged}
            <a href="/u/{$userStore?.nickname}">
                <img
                    class="border-border size-10 rounded-full border"
                    src={$userStore?.pictureUrl ||
                        "https://rolleimages.s3.sa-east-1.amazonaws.com/user/RolleTeste-549ebce1-d686-48fc-89d6-e43154ca0a9a.webp"}
                    alt="Foto de perfil"
                />
            </a>
        {:else}
            <button
                type="button"
                onclick={() => toggleSigninModal()}
                class="bg-border w-fit rounded-full p-2 cursor-pointer"
            >
                <UserIcon class="size-6" />
            </button>
        {/if}
    </div>
</nav>

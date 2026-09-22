<script lang="ts">
    import { onMount } from "svelte";
    import { CopySimpleIcon } from "phosphor-svelte";
    import { rolleApi } from "@rolle/api";
    import { Button, copyToClipboard } from "@rolle/ui";
    import { userStore } from "$lib/store";

    let accountLink = $derived(
        typeof $userStore?.providers?.instagramId === "string" &&
            $userStore.providers.instagramId.length > 0,
    );

    let code: number | undefined = $state();
    /* in seconds */
    let codeExpiration: number | undefined = $state();
    let hasCode = $derived(typeof code === "number");
    let loading = $state(true);
    onMount(() => {
        rolleApi.meta
            .code()
            .then((res) => {
                code = res.code;
                codeExpiration = res.expiration;
            })
            .catch((err) => {
                console.warn(err.message);
            })
            .finally(() => (loading = false));
    });
    /**
     * Timer down.
     */
    $effect(() => {
        let intervalId;
        if (typeof codeExpiration !== "number") {
            return;
        }

        intervalId = setInterval(() => {
            if (typeof codeExpiration !== "number" || codeExpiration <= 0) {
                return;
            }
            codeExpiration -= 1;
        }, 1000);

        return () => {
            if (typeof intervalId !== "undefined") {
                clearInterval(intervalId);
            }
        };
    });

    function formatTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    async function generateCode() {
        loading = true;
        const res = await rolleApi.meta.generateCode();
        code = res.code;
        codeExpiration = res.expiration;
        loading = false;
    }

    async function handleCopy() {
        if (typeof code !== "number") {
            return;
        }
        copyToClipboard(code.toString());
    }
</script>

<div class="mt-4 px-4">
    {#if accountLink}
        <!-- Linked account -->
        Sua conta ja esta vinculada a um perfil do instagram.
    {:else}
        <!-- No linked account -->
        {#if hasCode}
            <!-- Code already generated -->
            <div>Copie o código e envie nos envie no instagram via DM!</div>
            <div class="my-4 p-4 bg-background rounded-lg inline-flex items-center w-full">
                <div
                    class="flex-1 font-mono tracking-widest text-2xl font-semibold text-center select-all"
                >
                    {code}
                </div>
                <Button variation="ghost" onclick={handleCopy}>
                    <div class="text-xl">
                        <CopySimpleIcon />
                    </div>
                </Button>
            </div>
            {#if typeof codeExpiration === "number"}
                <div class="text-sm text-secondary-text">
                    Seu código expira em {formatTime(codeExpiration)}
                </div>
            {/if}
        {:else}
            <!-- No code generated -->
            <div>
                Basta gerar um código e enviar ele via DM a partir do perfil que você gostaria de
                vincular a sua conta rolle e pronto, nos responderemos sua DM confirmando o vinculo!
            </div>
        {/if}

        <div class="mt-4">
            <Button stretch outlined type="button" {loading} onclick={generateCode}>
                {#if hasCode}
                    Gerar novo código
                {:else}
                    Gerar código
                {/if}
            </Button>
        </div>
    {/if}
</div>

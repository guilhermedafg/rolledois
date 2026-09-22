<script lang="ts">
    import { fly } from "svelte/transition";
    import { useBlockScroll } from "../../utils";
    import Button from "./button.svelte";

    interface Props {
        open: boolean;
        title: string;
        description: string;
        action: () => Promise<void> | void;
    }

    let { open = $bindable(), action, title, description }: Props = $props();
    let loading = $state(false);

    useBlockScroll(() => open);

    function handleClose() {
        open = false;
    }

    async function handleSubmit() {
        if (loading) return;
        loading = true;
        try {
            await action();
        } finally {
            loading = false;
        }
    }
</script>

{#if open}
    <dialog
        open
        class="fixed inset-0 grid size-auto max-h-none max-w-none place-items-center overflow-y-auto bg-transparent px-8 backdrop:bg-transparent"
        transition:fly={{ y: 20, duration: 200 }}
    >
        <button
            type="button"
            onclick={handleClose}
            aria-label="backdrop"
            class="fixed inset-0 -z-10 bg-black/80"
        ></button>

        <div class="mx-auto h-fit max-w-[400px] rounded-lg bg-white p-4">
            <h5>
                {title}
            </h5>
            <div>
                {description}
            </div>
            <div class="mt-4 inline-flex w-full gap-2">
                <Button stretch form outlined variation="ghost" {loading} onclick={handleSubmit}>
                    Confirmar
                </Button>
                <Button stretch form outlined onclick={handleClose}>Cancelar</Button>
            </div>
        </div>
    </dialog>
{/if}

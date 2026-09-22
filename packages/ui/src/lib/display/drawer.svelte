<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import type { Snippet } from "svelte";
    import { useBlockScroll } from "../../utils";

    interface Props {
        children: Snippet;
        open: boolean;
        close: () => void;
    }
    const { children, open, close }: Props = $props();

    let dialogElement: HTMLDialogElement | undefined = $state();
    let backdropButtonElement: HTMLButtonElement | undefined = $state();

    // Prevents scrolling while this drawer is open.
    useBlockScroll(() => open);

    // Updates backdrop position.
    $effect(() => {
        if (open && typeof backdropButtonElement !== "undefined") {
            const scrollY =
                window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            backdropButtonElement.style.transform = `translateY(${scrollY}px)`;
        }
    });
</script>

{#if open}
    <button
        bind:this={backdropButtonElement}
        class="bg-black-25 absolute top-0 left-0 z-10 h-dvh w-full backdrop-blur-xs"
        aria-label="drawer backdrop"
        onclick={close}
        transition:fade={{ duration: 150 }}
    ></button>

    <dialog
        open
        bind:this={dialogElement}
        class="fixed bottom-0 left-0 z-10 flex w-full rounded-t-lg bg-white py-4"
        transition:fly={{ y: dialogElement?.getBoundingClientRect().height || 256, duration: 400 }}
    >
        {@render children()}
    </dialog>
{/if}

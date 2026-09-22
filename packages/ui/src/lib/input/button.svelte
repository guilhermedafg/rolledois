<script lang="ts">
    import { SpinnerGap } from "phosphor-svelte";
    import type { Snippet } from "svelte";

    import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props {
        children: Snippet;
        variation?: "primary" | "ghost" | "flat" | "border";
        textSize?: "sm" | "base" | "lg";
        outlined?: boolean;
        stretch?: boolean;
        loading?: boolean;
        active?: boolean;
        disabled?: boolean;
        form?: boolean;
        type?: HTMLButtonAttributes["type"];
        onclick?: HTMLButtonAttributes["onclick"];
    }

    const {
        children,
        onclick,
        active,
        variation = "primary",
        textSize = "base",
        outlined = false,
        stretch = false,
        loading = false,
        disabled = false,
        form = false,
        type = "button",
    }: Props = $props();
</script>

<!-- eslint-disable @typescript-eslint/naming-convention -->
<button
    {type}
    {onclick}
    {disabled}
    class={[
        "outline-primary-400 disabled:bg-disabled! disabled:text-secondary-text! inline-flex items-center justify-center gap-1 rounded-lg p-1.5 transition-all select-none cursor-pointer",
        {
            "w-full flex-1": stretch,
            "border-text border": outlined,
            "bg-text text-white":
                variation === "primary" || (variation === "flat" && active && !disabled),
            "bg-transparent": variation === "ghost" || (variation === "flat" && !active),
            "bg-primary-400 shadow-text border-text -translate-y-0.5 shadow-[0_4px]":
                variation === "border",
            "px-4 py-3": form,
            "p-1.5": !form,
            "text-sm": textSize === "sm",
            "text-base": textSize === "base",
            "text-lg": textSize === "lg",
        },
    ]}
>
    {#if loading}
        <SpinnerGap size={20} class="animate-spin" />
    {:else}
        {@render children()}
    {/if}
</button>

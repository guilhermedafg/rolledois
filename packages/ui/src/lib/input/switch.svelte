<script lang="ts">
    import { Field } from "@rolle/form";

    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        name: string;
        field?: Field<boolean>;
    }

    let checkboxElement: HTMLInputElement;

    const uid = $props.id();
    const { children, name, field = new Field<boolean>(false) }: Props = $props();
    const { value } = $derived(field);

    function handleClick(event: MouseEvent) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        checkboxElement.click();
    }
</script>

<button
    type="button"
    class="inline-flex items-center gap-2"
    onclick={handleClick}
    onfocus={field.handleFocus}
    onblur={field.handleBlur}
>
    <div class="switch">
        <input
            bind:this={checkboxElement}
            bind:checked={$value}
            onchange={field.handleInput}
            type="checkbox"
            id="{name}-{uid}"
            {name}
        />
        <span class="slider round"></span>
    </div>
    <label for="{name}-{uid}" class="pointer-events-none">{@render children()}</label>
</button>

<style lang="postcss">
    @reference "@rolle/config/style.css";

    .switch {
        @apply relative h-6 w-12;
    }

    .switch input {
        @apply invisible hidden opacity-0;
    }

    /* The slider */
    .slider {
        @apply bg-border absolute bottom-0 left-0 right-0 top-0 rounded-lg transition-all;
    }

    .slider:before {
        content: "";
        @apply absolute left-1 top-1 h-4 w-6 rounded-sm bg-white transition-all;
    }

    input:checked + .slider {
        @apply bg-primary-400;
    }

    input:checked + .slider:before {
        @apply translate-x-4;
    }
</style>

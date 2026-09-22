<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        class?: string;
        children: Snippet;
        element?: HTMLDivElement;
    }

    let { children, class: clazz, element = $bindable() }: Props = $props();

    function handleWheel(event: WheelEvent) {
        if (!element) return;

        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            element.scrollLeft += event.deltaY;
        }
    }
</script>

<div
    bind:this={element}
    onwheel={handleWheel}
    class={["hide-scrollbar w-full overflow-x-auto overflow-y-clip pointer-events-auto", clazz]}
>
    {@render children()}
</div>

<script lang="ts">
    import { fade } from "svelte/transition";
    import { CaretLeftIcon, CaretRightIcon, XIcon } from "phosphor-svelte";
    import { useBlockScroll } from "../../utils/";

    interface Props {
        open: boolean;
        index: number;
        images: string[];
        onBackdropClick?: () => void;
        onClose: () => void;
    }

    useBlockScroll(() => open);

    let {
        index = $bindable(),
        open,
        images,
        onClose,
        onBackdropClick = () => {},
    }: Props = $props();

    function prev() {
        index--;
    }

    function next() {
        index++;
    }
</script>

{#if open && images.length > 0}
    <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center"
        transition:fade={{ duration: 100 }}
    >
        <button
            type="button"
            onclick={onBackdropClick}
            aria-label="backdrop"
            class="absolute inset-0 -z-10 bg-black/80"
        ></button>
        <button type="button" class="absolute top-4 right-4 cursor-pointer" onclick={onClose}>
            <XIcon size={32} class="text-white" />
        </button>
        <div class="inline-flex items-center justify-between">
            <div class="grid w-1/10 shrink-0 grow-0 place-items-center">
                {#if index > 0 && images.length > 1}
                    <button type="button" onclick={prev} class="cursor-pointer">
                        <CaretLeftIcon size={32} class="text-white" />
                    </button>
                {/if}
            </div>
            <img src={images[index]} loading="lazy" alt="Imagem do carossel." class="w-4/5" />
            <div class="grid w-1/10 shrink-0 grow-0 place-items-center">
                {#if index < images.length - 1}
                    <button type="button" onclick={next} class="cursor-pointer">
                        <CaretRightIcon size={32} class="text-white" />
                    </button>
                {/if}
            </div>
        </div>
        <div class="mt-2 inline-flex gap-1">
            {#each images as _, i}
                <div
                    class="size-2.5 rounded-full border-2 border-white transition-all"
                    class:bg-white={i === index}
                ></div>
            {/each}
        </div>
    </div>
{/if}

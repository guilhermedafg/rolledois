<script module lang="ts">
    function toBase64(file: File): Promise<string> {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    }

    function isHttpUrl(str: string): boolean {
        try {
            const url = new URL(str);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }
</script>

<script lang="ts">
    import { CameraPlusIcon } from "phosphor-svelte";

    import { Field } from "@rolle/form";

    interface Props {
        class?: string;
        accept?: string;
        multiple?: boolean;
        field?: Field<string>;
    }

    let {
        accept = "image/jpeg, image/png, image/webp",
        multiple = false,
        field = new Field<string>(""),
        class: clazz,
    }: Props = $props();

    let inputElement: HTMLInputElement | undefined;
    let files: FileList | undefined = $state();

    const { value } = $derived(field);

    $effect(() => {
        if (typeof files !== "undefined" && files.length > 0) {
            toBase64(files[0]).then(value.set);
            field.validate();
        }
    });

    function handleClick(event: MouseEvent) {
        event.stopImmediatePropagation();
        inputElement?.click();
    }
</script>

{#snippet camera()}
    <CameraPlusIcon class="size-8 fill-white" />
{/snippet}

<button
    type="button"
    aria-label="Imagem de capa da lista"
    onclick={handleClick}
    class="relative grid place-items-center {clazz} overflow-hidden"
>
    <input
        type="file"
        bind:files
        bind:this={inputElement}
        {accept}
        {multiple}
        class="invisible hidden"
    />
    {#if typeof files !== "undefined" && files.length > 0 && typeof $value !== "undefined" && $value.length > 0}
        <img src={$value} alt="Cover da lista" class="rounded-lg object-cover {clazz}" />
    {:else if typeof $value !== "undefined" && isHttpUrl($value)}
        <img src={$value} alt="Cover da lista" class="rounded-lg object-cover {clazz}" />
        <div class="absolute grid h-full w-full place-items-center bg-black/16">
            {@render camera()}
        </div>
    {:else}
        <div class="bg-disabled grid place-items-center rounded-lg {clazz}">
            {@render camera()}
        </div>
    {/if}
</button>

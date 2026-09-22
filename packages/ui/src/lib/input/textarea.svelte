<script lang="ts">
    import { slide } from "svelte/transition";
    import { Field } from "@rolle/form";
    import {
        inputClasses,
        inputColors,
        type TextfieldStatus,
        type TextfieldColor,
    } from "./textfield";
    import type { FullAutoFill } from "svelte/elements";
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props {
        name: string;
        rows?: number;
        label?: string;
        placeholder?: string;
        color?: TextfieldColor;
        required?: boolean;
        disabled?: boolean;
        inputmode?: HTMLInputAttributes["inputmode"];
        autocomplete?: FullAutoFill;
        field?: Field<string>;
        autogrow?: boolean;
    }

    let {
        name,
        rows = undefined,
        label = "",
        placeholder = "",
        color = "primary",
        required = false,
        disabled = false,
        inputmode = undefined,
        autocomplete = undefined,
        autogrow = false,
        field = new Field<string>(""),
    }: Props = $props();
    const { value, focus, errorMessage } = $derived(field);

    let textareaEl = $state<HTMLTextAreaElement>();

    $effect(() => {
        if (!autogrow) return;
        if (typeof textareaEl === "undefined") return;
        textareaEl.style.height = "auto";
        textareaEl.style.height = textareaEl.scrollHeight + 2 + "px";
        textareaEl.addEventListener("input", () => {
            if (typeof textareaEl === "undefined") return;
            textareaEl.style.height = "auto";
            textareaEl.style.height = textareaEl.scrollHeight + 2 + "px";
        });
    });

    let status: TextfieldStatus = $state("valid");
    $effect(() => {
        if ($errorMessage && $focus) {
            status = "warning";
        } else if ($errorMessage) {
            status = "error";
        } else {
            status = "valid";
        }
    });

    let inputClass = $derived(
        `textfield ${inputColors[color]} ${inputClasses[status]} text-sm disabled:bg-disabled disabled:cursor-not-allowed`,
    );
</script>

<div class="flex w-full flex-col-reverse gap-1">
    {#if $errorMessage}
        <div
            transition:slide|local
            class="text-error pl-1 text-xs"
            class:!text-warning={status === "warning"}
        >
            {$errorMessage}
        </div>
    {/if}
    <textarea
        bind:this={textareaEl}
        id={name}
        {name}
        {placeholder}
        {autocomplete}
        {required}
        {disabled}
        {inputmode}
        {rows}
        bind:value={$value}
        onfocus={field.handleFocus}
        oninput={field.handleInput}
        onblur={field.handleBlur}
        class={`peer ${inputClass}`}
    ></textarea>
    {#if label.length > 0}
        <label
            for={name}
            class="peer-required:after:text-error w-full pl-1 peer-required:after:pl-0.5 peer-required:after:content-['*']"
        >
            {label}
        </label>
    {/if}
</div>

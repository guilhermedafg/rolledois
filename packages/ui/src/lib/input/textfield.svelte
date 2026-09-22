<script lang="ts">
    import { slide } from "svelte/transition";
    import { Field } from "@rolle/form";
    import {
        inputClasses,
        inputColors,
        type TextfieldStatus,
        type TextfieldColor,
    } from "./textfield";
    import type { Snippet } from "svelte";
    import type {
        HTMLInputTypeAttribute,
        HTMLInputAttributes,
        FullAutoFill,
    } from "svelte/elements";
    import type { Masks } from "../../utils";

    interface Props {
        name: string;
        label?: string;
        placeholder?: string;
        color?: TextfieldColor;
        required?: boolean;
        disabled?: boolean;
        autocomplete?: FullAutoFill;
        type?: HTMLInputTypeAttribute;
        inputmode?: HTMLInputAttributes["inputmode"];
        autocapitalize?: HTMLInputAttributes["autocapitalize"];
        spellcheck?: HTMLInputAttributes["spellcheck"];
        field?: Field<any>;
        iconRight?: Snippet<[number]>;
        inputElement?: HTMLInputElement;
        mask?: Masks.Mask;
    }

    let {
        name,
        inputmode,
        autocomplete,
        label = "",
        placeholder = "",
        color = "primary",
        required = false,
        disabled = false,
        type = "text",
        field = new Field<string>(""),
        inputElement = $bindable(),
        iconRight,
        mask,
    }: Props = $props();
    const { value, focus, errorMessage } = $derived(field);

    let initialDisplayValue = $derived(
        $value.length > 0 && typeof mask === "function" ? mask($value)[0] : $value,
    );
    let displayValue = $derived(initialDisplayValue);

    let status: TextfieldStatus = $state("valid");

    let inputClass = $derived(
        `textfield ${inputColors[color]} ${inputClasses[status]} text-sm disabled:bg-disabled disabled:text-secondary-text disabled:cursor-not-allowed`,
    );

    $effect(() => {
        if ($value.length === 0) displayValue = "";
    });

    $effect(() => {
        if ($errorMessage && $focus) {
            status = "warning";
        } else if ($errorMessage) {
            status = "error";
        } else {
            status = "valid";
        }
    });

    function handleInput(event: Event) {
        if (!(event instanceof InputEvent)) return;
        const element = event.currentTarget as HTMLInputElement;

        if (typeof mask !== "function") {
            value.set(element.value);
            field.handleInput();
            return;
        }

        const [formated, raw] = mask(element.value);
        displayValue = formated;
        value.set(raw);
        field.handleInput();
    }
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
    <div class="relative">
        <input
            id={name}
            {name}
            {placeholder}
            {autocomplete}
            {required}
            {disabled}
            {type}
            {inputmode}
            bind:this={inputElement}
            bind:value={displayValue}
            onfocus={field.handleFocus}
            oninput={handleInput}
            onblur={field.handleBlur}
            class={[`peer ${inputClass}`, { ["pr-10"]: typeof iconRight !== "undefined" }]}
        />

        {#if typeof iconRight !== "undefined"}
            <div class="text-border absolute top-1/2 right-4 z-1 grid h-fit w-fit -translate-y-1/2">
                {@render iconRight(16)}
            </div>
        {/if}
    </div>
    {#if label.length > 0}
        <label
            for={name}
            class="text-secondary-text peer-required:after:text-error w-full pl-1 text-sm peer-required:after:pl-0.5 peer-required:after:content-['*']"
        >
            {label}
        </label>
    {/if}
</div>

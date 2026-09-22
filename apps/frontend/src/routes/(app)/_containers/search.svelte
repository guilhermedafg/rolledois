<script lang="ts">
    import { RecordId } from "surrealdb";
    import { goto } from "$app/navigation";
    import {
        Textfield,
        VenueCategoryTag,
        VENUE_CATEGORIES,
        type VenueCategoryMapped,
        idFromRecordId,
        HorizontalScroll,
    } from "@rolle/ui";
    import { setPausableInterval } from "$lib/helpers";

    interface Props {
        onCategoryClick: (categoryId: RecordId) => void | Promise<void>;
        categorySelected: VenueCategoryMapped;
    }

    const { onCategoryClick, categorySelected }: Props = $props();

    const venuesCategories = ["todos", ...VENUE_CATEGORIES].map(
        (c) => new RecordId("venueCategory", c),
    );

    /**
     * Search input placeholder animation.
     */
    let searchPlaceholder = $state("Procure por");
    const placeholderTextwritter = ["cafés", "música", "parques", "cerveja"];
    $effect(() => {
        let textIndex = 0;
        let wordIndex = 0;
        /* If the text should write or erase */
        let isWritting = true;
        let interval = setPausableInterval(() => {
            const word = placeholderTextwritter[textIndex];

            // Start erase
            if (wordIndex >= word.length && isWritting) {
                isWritting = false;
                interval.stop();
                setTimeout(interval.start, 2500);
                return;
            }

            // Next word
            if (wordIndex === 0 && !isWritting) {
                isWritting = true;
                if (textIndex >= placeholderTextwritter.length - 1) {
                    textIndex = 0;
                    return;
                }
                textIndex += 1;
                return;
            }

            if (isWritting) {
                wordIndex += 1;
            } else {
                wordIndex -= 1;
            }

            searchPlaceholder = `Procure por ${word.substring(0, wordIndex)}`;
        }, 75);
        interval.start();

        return () => {
            interval.stop();
        };
    });
</script>

<div class="absolute top-0 left-0 w-full">
    <div class="w-full pt-2 pr-12 pl-4">
        <button onclick={() => goto("/search")} class="w-full rounded-lg bg-white">
            <Textfield name="query" placeholder={searchPlaceholder} />
        </button>
    </div>

    <HorizontalScroll class="inline-flex gap-2 p-4">
        {#each venuesCategories as categoryId (categoryId)}
            <button onclick={() => onCategoryClick(categoryId)} class="cursor-pointer">
                <VenueCategoryTag
                    active={categorySelected === idFromRecordId(categoryId)}
                    {categoryId}
                />
            </button>
        {/each}
    </HorizontalScroll>
</div>

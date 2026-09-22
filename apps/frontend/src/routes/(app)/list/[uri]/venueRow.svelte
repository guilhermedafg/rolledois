<script lang="ts">
    import { slide } from "svelte/transition";
    import { Field } from "@rolle/form";
    import { rolleApi } from "@rolle/api";
    import { Button, Textarea } from "@rolle/ui";
    import { VenueRow } from "$lib/containers";
    import { userStore } from "$lib/store";

    import type { List, ListFull, Venue } from "@rolle/types";
    import type { Mixpanel } from "mixpanel-browser/src/loaders/loader-module-core";

    interface Props {
        list: List;
        venue: Venue;
        mixpanel: Mixpanel;
        comment?: string;
        afterComment?: (updatedList: ListFull) => void;
    }

    let { venue, list, comment = "", mixpanel }: Props = $props();
    const field = new Field((() => comment)());
    const { value } = field;

    let loading = $state(false);
    let isListOwner = $derived(
        typeof $userStore !== "undefined" && $userStore.id === list.owner.id,
    );

    let commentary = $derived(() => {
        if (isListOwner) return undefined;
        if (typeof comment !== "undefined" && comment.length > 0) return comment;
    });

    async function handleSubmit() {
        loading = true;
        await rolleApi.list
            .comment(list.id.toString(), {
                venueId: venue.id,
                comment: $value,
            })
            .then(() => {
                comment = $value;
            })
            .finally(() => {
                loading = false;
            });
    }
</script>

<div class="flex w-full flex-col gap-3 px-4">
    <div class="flex flex-col gap-2">
        <VenueRow {venue} {mixpanel} listOwner={list.owner} comment={commentary()} />
        {#if isListOwner}
            <div class="bg-background rounded-lg">
                <Textarea
                    rows={1}
                    autogrow
                    name="desc-{venue.id}"
                    placeholder="Incluir uma nota sobre o local"
                    {field}
                />
            </div>
            {#if $value !== comment}
                <div transition:slide>
                    <Button form stretch {loading} onclick={handleSubmit}>
                        <div class="text-sm">Salvar</div>
                    </Button>
                </div>
            {/if}
        {/if}
    </div>
</div>

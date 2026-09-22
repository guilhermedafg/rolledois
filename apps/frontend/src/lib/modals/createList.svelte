<script lang="ts">
    import { fly } from "svelte/transition";
    import { Field, Form, Validators } from "@rolle/form";
    import { Button, Imagefield, Switch, Textarea, Textfield } from "@rolle/ui";
    import { XIcon } from "phosphor-svelte";

    import {
        createListModalState,
        setCreateListPlaceId,
        toggleCreateListModal,
    } from "./createList.svelte.ts";
    import { rolleApi } from "@rolle/api";
    import { useBlockScroll } from "./_util.svelte.ts";

    // Prevents scrolling while this modal is open.
    useBlockScroll(() => $createListModalState.open);

    let loading = $state(false);
    const form = new Form({
        name: new Field<string>("", [Validators.required]),
        description: new Field<string>(""),
        imageBase64: new Field<string>(""),
        private: new Field<boolean>(false),
        venues: new Field<Array<string>>([]),
        events: new Field<Array<string>>([]),
    });
    const { valid } = form;

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        loading = true;
        const list = await rolleApi.list.create(form.values).finally(() => (loading = false));

        if (typeof $createListModalState.placeId !== "undefined") {
            await rolleApi.list.addVenue(list.id.toString(), {
                placeId: $createListModalState.placeId!,
            });
            setCreateListPlaceId(undefined);
        }

        toggleCreateListModal();
        form.resetFields();
    }
</script>

{#if $createListModalState.open}
    <dialog
        open
        class="sticky inset-0 z-10 h-dvh w-full bg-white p-4"
        transition:fly={{ y: 20, duration: 200 }}
    >
        <!-- header -->
        <div class="relative flex h-fit w-full items-center justify-between">
            <XIcon size={24} onclick={toggleCreateListModal} />
            <h6>Criar lista</h6>
            <div class="w-6 shrink-0"></div>
        </div>

        <!-- form -->
        <form onsubmit={handleSubmit} class="mt-4 flex flex-col items-center gap-2">
            <Imagefield field={form.fields.imageBase64} class="aspect-2/3 w-32" />
            <Textfield
                required
                name="name"
                field={form.fields.name}
                placeholder="Nome da lista"
                autocomplete="off"
            />
            <Textarea
                rows={4}
                name="description"
                field={form.fields.description}
                placeholder="Descrição da lista"
            />
            <div class="inline-flex w-full items-start">
                <Switch name="private" field={form.fields.private}>
                    <div class="flex flex-col items-start">
                        <span class="font-bold">Tornar esta lista privada?</span>
                        <span class="text-sm">Somente você poderá acessar essa lista</span>
                    </div>
                </Switch>
            </div>
            <Button type="submit" stretch form {loading} disabled={!$valid}>Criar lista</Button>
        </form>
    </dialog>
{/if}

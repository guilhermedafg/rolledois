<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { rolleApi } from "@rolle/api";
    import { userStore } from "$lib/store";
    import { Field, Form, Validators } from "@rolle/form";
    import { Button, Imagefield, Switch, Textarea, Textfield, ConfirmationDialog } from "@rolle/ui";
    import { CaretLeftIcon, TrashIcon } from "phosphor-svelte";

    const { data } = $props();
    const list = (() => data)().list;

    let deleteConfimationDialog = $state(false);

    onMount(() => {
        if (
            typeof $userStore === "undefined" ||
            $userStore.id.toString() !== list.owner.id.toString()
        ) {
            setTimeout(() => goto("/", { replaceState: true }), 100);
        }
    });

    let loading = $state(false);
    const form = new Form({
        name: new Field<string>(list.name, [Validators.required], { validateOnInit: true }),
        description: new Field<string>(list.description || ""),
        imageBase64: new Field<string>(list.cover?.thumbUrl || ""),
        private: new Field<boolean>(list.private),
    });
    const { valid } = form;

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (!$valid || loading) return;
        loading = true;
        await rolleApi.list
            .update(list.id.toString(), form.values)
            .finally(() => (loading = false));
        window.history.back();
    }

    function toggleDeleteConfimationDialog() {
        deleteConfimationDialog = !deleteConfimationDialog;
    }

    async function handleDelete() {
        await rolleApi.list.deleteOne(list.id.toString());
        await goto(`/u/${list.owner.nickname}`);
    }
</script>

<div class="p-4">
    <!-- header -->
    <div class="relative flex h-fit w-full items-center justify-between">
        <CaretLeftIcon size={24} onclick={() => window.history.back()} />
        <div class="font-rounded font-bold">Editar lista</div>
        <div class="w-6 shrink-0"></div>
    </div>

    <!-- form -->
    <form onsubmit={handleSubmit} class="mt-4 flex flex-col items-center gap-2">
        <Imagefield field={form.fields.imageBase64} class="aspect-2/3 w-32" />
        <Textfield
            name="name"
            field={form.fields.name}
            placeholder="Nome da lista"
            autocomplete="off"
            required
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
        <Button type="submit" stretch form {loading} disabled={!$valid}>Salvar</Button>
    </form>

    <div class="mt-4">
        <Button
            type="button"
            variation="ghost"
            textSize="sm"
            outlined
            stretch
            onclick={toggleDeleteConfimationDialog}
        >
            <TrashIcon />
            Excluir
        </Button>
    </div>
</div>

<ConfirmationDialog
    bind:open={deleteConfimationDialog}
    title="Deletar lista"
    description="Tem certeza que deseja deletar essa lista? Todos os dados relacionados a ela serão perdidos."
    action={handleDelete}
/>

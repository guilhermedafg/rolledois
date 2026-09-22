<script lang="ts">
    import { debounce } from "throttle-debounce";
    import { goto } from "$app/navigation";
    import { rolleApi } from "@rolle/api";
    import { userStore } from "$lib/store";

    import { Form, Field, Validators } from "@rolle/form";
    import { Button, Imagefield, Masks, Textarea, Textfield } from "@rolle/ui";
    import { CaretLeftIcon } from "phosphor-svelte";

    let loading = $state(false);
    const form = new Form({
        nickname: new Field<string>(
            $userStore?.nickname || "",
            [Validators.required, Validators.checkNoWhitespace],
            {
                validateOnInit: true,
            },
        ),
        pictureBase64: new Field<string>($userStore?.pictureUrl || ""),
        phone: new Field<string>($userStore?.phone || ""),
        name: {
            first: new Field<string>($userStore?.name.first || "", [Validators.required], {
                validateOnInit: true,
            }),
            last: new Field<string>($userStore?.name.last || "", [Validators.required], {
                validateOnInit: true,
            }),
        },
        bio: {
            long: new Field<string>($userStore?.bio.long || ""),
            short: new Field<string>($userStore?.bio.short || ""),
        },
    });
    const { valid } = form;

    const { value: nicknameValue, valid: nicknameValid } = form.fields.nickname;
    let nicknameAvaliable = $state(false);
    $effect(() => {
        if (!$nicknameValid) return;
        nicknameAvaliable = false;
        debouncedCheckNickname($nicknameValue);
    });
    async function checkNickname(nickname: string) {
        if ($userStore?.nickname === nickname) {
            form.fields.nickname.setErrorMessage(undefined);
            form.fields.nickname.valid.set(true);
            form.validate();
            nicknameAvaliable = true;
            return;
        }
        const alreadyTaken = await rolleApi.auth.checkNickname(nickname);
        if (alreadyTaken) {
            form.fields.nickname.setErrorMessage("Nickname já esta em uso.");
            form.fields.nickname.valid.set(false);
            form.validate();
            nicknameAvaliable = false;
            return;
        }
        nicknameAvaliable = true;
    }
    const debouncedCheckNickname = debounce(750, checkNickname, { atBegin: false });

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (!$valid || loading) return;
        loading = true;
        await userStore
            .update(form.values)
            .then(() => goto(`/u/${$userStore?.nickname}`))
            .finally(() => (loading = false));
    }
</script>

<div class="flex flex-col items-center gap-1 p-4">
    {#if !$userStore?.meta.isInstagramLinked}
        <a href="./instagram" class="mt-2 w-full">
            <Button stretch outlined variation="border" type="button">Link com instagram</Button>
        </a>
    {/if}

    <div class="relative flex h-fit w-full items-center justify-between mt-4">
        <CaretLeftIcon size={24} onclick={() => window.history.back()} />
        <div class="font-rounded font-bold">Editar Perfil</div>
        <div class="w-6 shrink-0"></div>
    </div>

    <form onsubmit={handleSubmit} class="flex flex-1 flex-col gap-3">
        <div class="flex items-center justify-center">
            <Imagefield field={form.fields.pictureBase64} class="size-20 rounded-full!" />
        </div>
        <Textfield
            label="Nickname"
            name="nickname"
            placeholder="Seu @"
            field={form.fields.nickname}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
        />
        <div class="flex flex-row items-start gap-3">
            <Textfield
                label="Primeiro nome"
                name="firstName"
                placeholder="Primeiro nome"
                field={form.fields.name.first}
                autocomplete="given-name"
                spellcheck="false"
                autocapitalize="on"
                required
            />
            <Textfield
                label="Sobrenome"
                name="lastName"
                placeholder="Sobrenome"
                field={form.fields.name.last}
                autocomplete="family-name"
                spellcheck="false"
                autocapitalize="on"
                required
            />
        </div>
        <Textfield
            label="Telefone"
            name="phone"
            placeholder="(xx) xxxxx-xxxx"
            field={form.fields.phone}
            autocomplete="mobile tel"
            inputmode="numeric"
            mask={Masks.cellphone}
        />
        <Textfield
            label="Curta descrição sobre você"
            name="shortDescription"
            placeholder=""
            field={form.fields.bio.short}
            autocomplete="off"
        />
        <Textarea
            rows={4}
            label="Longa descrição sobre você"
            name="longDescription"
            placeholder=""
            field={form.fields.bio.long}
            autocomplete="off"
        />

        <Button stretch type="submit" form {loading} disabled={!$valid || !nicknameAvaliable}>
            Salvar
        </Button>
    </form>

    <div class="mt-4 w-full">
        <Button type="button" outlined stretch onclick={userStore.signOut} variation="ghost">
            Sair da conta
        </Button>
    </div>
</div>

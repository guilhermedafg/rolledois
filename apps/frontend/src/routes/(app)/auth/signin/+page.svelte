<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    import { rolleApi } from "@rolle/api";
    import { Button, Logo, Textfield } from "@rolle/ui";
    import { Field, Form, Validators } from "@rolle/form";
    import { RolleError } from "@rolle/error";
    import { userStore } from "$lib/store";

    const loginForm = new Form({
        email: new Field<string>("", [Validators.required, Validators.email]),
        password: new Field<string>("", [Validators.required]),
    });
    const { valid } = loginForm;
    let loading = $state(false);

    onMount(async () => {
        const code = page.url.searchParams.get("code");
        if (!code) {
            return;
        }

        await rolleApi.auth.googleSign({ code });
        await goto("/");
    });

    async function signIn(event: SubmitEvent) {
        event.preventDefault();
        if (!$valid || loading) return;
        try {
            loading = true;
            await userStore.signIn(loginForm.values);
        } catch (error) {
            if (RolleError.isInputValidationError(error) && typeof error.meta !== "undefined") {
                const errors = error.meta.fields;
                loginForm.handleErrors(errors);
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex h-[calc(100dvh-64px)] flex-col items-center gap-1 p-4">
    <Logo opaque class="w-20 py-5" />
    {#if $userStore}
        <button
            type="button"
            onclick={userStore.signOut}
            class="bg-primary-400 w-full rounded-lg p-4 text-black"
        >
            Sair
        </button>
    {:else}
        <div class="w-full text-left text-xl font-semibold">Entrar</div>
        <form onsubmit={signIn} class="flex w-full flex-1 flex-col gap-3">
            <Textfield
                type="email"
                name="email"
                field={loginForm.fields.email}
                autocomplete="email"
                placeholder="Digite seu email"
                required
            />
            <Textfield
                type="password"
                name="password"
                field={loginForm.fields.password}
                autocomplete="off"
                placeholder="Digite sua senha"
                required
            />
            <a href="/auth/forgot-password" class="text-left text-sm text-sky-500">
                Esqueci minha senha
            </a>
            <Button type="submit" form {loading} disabled={!$valid}>Continuar</Button>
        </form>
    {/if}
</div>

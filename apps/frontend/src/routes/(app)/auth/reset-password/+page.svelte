<script lang="ts">
    import { rolleApi } from "@rolle/api";
    import { isRolleError } from "@rolle/error";
    import { Field, Validators } from "@rolle/form";
    import { Button, Logo, Textfield } from "@rolle/ui";

    const { data } = $props();

    let loading = $state(false);

    const passwordField = new Field<string>("", [Validators.required]);
    const { value: password, valid: passwordValid } = passwordField;
    const confirmPasswordField = new Field<string>("", [Validators.required]);
    const { value: confirmPassword, touched } = confirmPasswordField;
    const valid = $derived($passwordValid && $password === $confirmPassword);

    let errorMessage = $state("");
    let success = $state(false);

    $effect(() => {
        if (!$touched) return;
        if (!$passwordValid) return;
        if ($password === $confirmPassword) return;
        confirmPasswordField.setErrorMessage("Senhas não correspondem.");
    });

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (loading) return;
        loading = true;
        try {
            const response = await rolleApi.auth.resetPassword({
                password: $password,
                token: data.token,
            });
            success = response;
        } catch (error) {
            if (isRolleError(error)) {
                errorMessage = error.message;
            } else {
                errorMessage = "Algo deu errado.";
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="grid w-full place-items-center gap-4 p-4">
    <Logo opaque class="w-32" />

    {#if errorMessage.length > 0}
        <div>
            {errorMessage}
        </div>
        <a href="/auth/forgot-password">Reenviar email</a>
    {:else if success}
        <div>Senha alterada com sucesso!</div>
        <a href="/auth/signin">Ir para o login</a>
    {:else}
        <form onsubmit={handleSubmit} class="flex w-full flex-1 flex-col gap-3">
            <Textfield
                type="password"
                name="password"
                label="Nova senha"
                field={passwordField}
                autocomplete="off"
                placeholder="********"
                required
            />
            <Textfield
                type="password"
                name="confirmPassword"
                label="Confirme a senha"
                field={confirmPasswordField}
                autocomplete="off"
                placeholder="********"
                required
            />
            <Button type="submit" form {loading} disabled={!valid}>Continuar</Button>
        </form>
    {/if}
</div>

<script lang="ts">
    import { rolleApi } from "@rolle/api";
    import { isRolleError } from "@rolle/error";
    import { Field, Form, Validators } from "@rolle/form";
    import { Button, Logo, Textfield } from "@rolle/ui";

    const form = new Form({
        email: new Field<string>("", [Validators.required, Validators.email]),
    });
    const { valid } = form;
    let loading = $state(false);
    let emailSent = $state(false);

    async function handleSubmit() {
        if (loading) return;
        loading = true;

        try {
            const success = await rolleApi.auth.forgotPassword(form.values.email);

            if (success) {
                emailSent = true;
            }
        } catch (error) {
            if (isRolleError(error)) {
                form.fields.email.setErrorMessage(error.message);
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex flex-col items-center gap-4 p-4">
    <Logo opaque class="w-32" />

    {#if !emailSent}
        <div>Insira seu email</div>

        <form onsubmit={handleSubmit} class="flex w-full flex-1 flex-col gap-3">
            <Textfield
                type="email"
                name="email"
                field={form.fields.email}
                autocomplete="email"
                placeholder="Digite seu email"
                required
            />
            <Button type="submit" form {loading} disabled={!$valid}>Continuar</Button>
        </form>
    {:else}
        <div>Email enviado com sucesso!</div>
    {/if}
</div>

<script lang="ts">
    import { fly } from "svelte/transition";
    import { debounce } from "throttle-debounce";

    import { rolleApi } from "@rolle/api";
    import { Field, Validators } from "@rolle/form";
    import { isRolleError, RolleError } from "@rolle/error";
    import { Button, GoogleSignButton, Logo, Textfield } from "@rolle/ui";

    import { userStore } from "$lib/store";
    import { useBlockScroll } from "./_util.svelte.ts";
    import { signinModalState, toggleSigninModal } from "./signin.svelte.ts";
    import { goto } from "$app/navigation";
    import { CaretLeftIcon } from "phosphor-svelte";

    // Prevents scrolling while this modal is open.
    useBlockScroll(() => signinModalState.open);

    let loading = $state(false);
    const email = new Field<string>("", [Validators.email]);
    const { value: emailValue, valid: emailValid } = email;
    const password = new Field<string>("", [Validators.required]);
    const { value: passValue, valid: passValid } = password;

    let emailType: "credential" | "social" | "new" | undefined = $state();

    async function googleAuthUrl() {
        const res = await rolleApi.auth.googleAuthUrl();
        window.location.href = res.url;
    }

    $effect(() => {
        if (!$emailValid) return;
        loading = true;
        debouncedValiteEmail($emailValue);
    });
    async function validateEmail(value: string) {
        if (!$emailValid) return;
        try {
            const response = await rolleApi.auth.checkEmailType(value);
            emailType = response.type;
        } catch (error) {
            if (!isRolleError(error)) return;
            if (error.code === "Rolle.Resource.NotFound") {
                emailType = "new";
            }
        } finally {
            loading = false;
        }
    }
    const debouncedValiteEmail = debounce(750, validateEmail, { atBegin: false });

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        switch (emailType) {
            case "new": {
                const searchParams = new URLSearchParams();
                searchParams.set("email", $emailValue);
                goto(`/auth/signup?${searchParams.toString()}`);
                toggleSigninModal();
                return;
            }
            case "social": {
                return await googleAuthUrl();
            }
            case "credential": {
                if (!$emailValid || !$passValid) return;

                try {
                    await userStore.signIn({ email: $emailValue, password: $passValue });
                    toggleSigninModal();
                    return;
                } catch (error) {
                    if (
                        RolleError.isInputValidationError(error) &&
                        typeof error.meta !== "undefined"
                    ) {
                        const errors = error.meta.fields;
                        if (typeof errors.email === "string") {
                            email.setErrorMessage(errors.email);
                            email.valid.set(false);
                        }
                        if (typeof errors.password === "string") {
                            password.setErrorMessage(errors.password);
                            password.valid.set(false);
                        }
                    }
                }
            }
        }
    }
</script>

{#if signinModalState.open}
    <dialog open class="sticky inset-0 z-10 top-0 w-full" transition:fly={{ y: 20, duration: 200 }}>
        <div class="bg-border flex h-dvh w-full flex-col px-4">
            <div class="mt-10 inline-flex items-center gap-2">
                <button onclick={() => toggleSigninModal()} class="cursor-pointer">
                    <CaretLeftIcon size={20} />
                </button>
                <div class="w-20">
                    <Logo />
                </div>
            </div>
            <div class="font-rounded mt-4 w-3/4 max-w-96 text-4xl font-bold">
                <span class="text-secondary"> Salve, organize e compartilhe </span>
                seus lugares favoritos em um só lugar.
            </div>

            <form onsubmit={handleSubmit} class="mt-4 flex w-full flex-col items-center gap-4">
                <Textfield
                    type="email"
                    name="email"
                    placeholder="Digite seu email"
                    autocomplete="email"
                    autocapitalize="off"
                    spellcheck="false"
                    field={email}
                    required
                />
                {#if emailType === "credential"}
                    <Textfield
                        type="password"
                        name="password"
                        placeholder="********"
                        autocomplete="off"
                        autocapitalize="off"
                        spellcheck="false"
                        field={password}
                        required
                    />
                {/if}
                <Button stretch {loading} type="submit">Continuar</Button>
            </form>

            <div class="mt-4">
                <GoogleSignButton onclick={googleAuthUrl} />
            </div>
        </div>
    </dialog>
{/if}

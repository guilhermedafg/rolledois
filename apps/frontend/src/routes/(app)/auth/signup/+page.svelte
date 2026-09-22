<script lang="ts">
    import { debounce } from "throttle-debounce";

    import { CaretLeftIcon } from "phosphor-svelte";
    import { rolleApi } from "@rolle/api";
    import { RolleError } from "@rolle/error";
    import { Form, Field, Validators } from "@rolle/form";
    import { Button, Logo, Masks, Textfield } from "@rolle/ui";

    import { userStore } from "$lib/store";
    import { goto } from "$app/navigation";

    const { data } = $props();

    /**
     * Steps...
     */
    let step = $state(1);

    function stepBack() {
        if (step > 1) step -= 1;
        if (step === 1) window.history.back();
    }

    function handleStepSubmit(event: SubmitEvent) {
        event.preventDefault();
        step += 1;
    }

    /**
     * Form
     */
    const form = new Form({
        email: new Field<string>((() => data)().email, [Validators.required, Validators.email], {
            validateOnInit: true,
        }),
        password: new Field<string>("", [Validators.required, Validators.min(8)]),
        nickname: new Field<string>("", [Validators.required]),
        pictureBase64: new Field<string>(""),
        phone: new Field<string>(""),
        name: {
            first: new Field<string>(""),
            last: new Field<string>(""),
        },
    });
    const checkPasswordField = new Field<string>("", [Validators.required]);
    const { value: nicknameValue, valid: nicknameValid } = form.fields.nickname;
    const { value: passValue, valid: passValid } = form.fields.password;
    const { value: checkPassValue } = checkPasswordField;
    const { value: phoneValue } = form.fields.phone;
    const { valid } = form;

    let passwordElement: HTMLInputElement | undefined = $state();
    let nicknameElement: HTMLInputElement | undefined = $state();
    let phoneElement: HTMLInputElement | undefined = $state();
    $effect(() => {
        switch (step) {
            case 1: {
                if (typeof passwordElement !== "undefined") {
                    passwordElement.focus();
                }
                break;
            }
            case 2: {
                if (typeof nicknameElement !== "undefined") {
                    nicknameElement.focus();
                }
                break;
            }
            case 3: {
                if (typeof phoneElement !== "undefined") {
                    phoneElement.focus();
                }
                break;
            }
        }
    });

    let nicknameAvaliable = $state(false);
    $effect(() => {
        if (!$nicknameValid) return;
        nicknameAvaliable = false;
        debouncedCheckNickname($nicknameValue);
    });
    async function checkNickname(nickname: string) {
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

    let loading = $state(false);
    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (!$valid || loading) return;
        loading = true;
        try {
            await rolleApi.auth.signUp(form.values);
            await userStore.signIn({ email: form.values.email, password: form.values.password });
            step += 1;
        } catch (error) {
            if (RolleError.isInputValidationError(error) && typeof error.meta !== "undefined") {
                const errors = error.meta.fields;
                form.handleErrors(errors);
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="sticky inset-0 z-10">
    <div class="bg-border flex h-dvh w-full flex-col px-4">
        <div class="mt-10 inline-flex items-center gap-2">
            <button
                class="bg-border grid shrink-0 place-items-center rounded-full cursor-pointer"
                onclick={stepBack}
            >
                <CaretLeftIcon size={24} />
            </button>
            <div class="w-20">
                <Logo />
            </div>
        </div>

        {#if step === 1}
            <!-- NOTE: password -->
            <div class="font-rounded mt-4 w-3/4 max-w-96 text-4xl font-bold">
                <span class="text-secondary"> Explore </span>
                agora e comece salvando seu primeiro lugar.
            </div>
            <div class="bg-secondary mt-4 h-2 w-8"></div>
            <form class="mt-4 flex flex-col gap-2" onsubmit={handleStepSubmit}>
                <Textfield
                    type="password"
                    name="password"
                    placeholder="Criar senha"
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck="false"
                    field={form.fields.password}
                    bind:inputElement={passwordElement}
                    required
                />
                <Textfield
                    type="password"
                    name="confirm_password"
                    placeholder="Confirmar senha"
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck="false"
                    field={checkPasswordField}
                    required
                />
                <Button type="submit" disabled={!$passValid || $passValue !== $checkPassValue}>
                    Proximo
                </Button>
            </form>
        {:else if step === 2}
            <!-- NOTE: nickname -->
            <div class="font-rounded mt-4 w-3/4 max-w-96 text-4xl font-bold">
                Crie um <span class="text-secondary"> apelido </span>
                para pessoas saberem quem você é.
            </div>
            <div class="bg-secondary mt-4 h-2 w-8"></div>
            <form class="mt-4 flex flex-col gap-2" onsubmit={handleStepSubmit}>
                <Textfield
                    type="text"
                    name="nickname"
                    placeholder="@apelido"
                    autocapitalize="off"
                    spellcheck="false"
                    field={form.fields.nickname}
                    bind:inputElement={nicknameElement}
                    required
                />
                <Button type="submit" disabled={!nicknameAvaliable || !$nicknameValid}>
                    Proximo
                </Button>
            </form>
        {:else if step === 3}
            <!-- NOTE: phone -->
            <div class="font-rounded mt-4 w-3/4 max-w-96 text-4xl font-bold">
                Adicione seu <span class="text-secondary"> telefone </span>
                para receber novidades futuramente.
            </div>
            <div class="bg-secondary mt-4 h-2 w-8"></div>
            <form class="mt-4 flex flex-col gap-2" onsubmit={handleSubmit}>
                <Textfield
                    name="phone"
                    placeholder="(xx) xxxxx-xxxx"
                    field={form.fields.phone}
                    autocomplete="mobile tel"
                    inputmode="numeric"
                    bind:inputElement={phoneElement}
                    mask={Masks.cellphone}
                />
                <Button type="submit" disabled={$phoneValue.length !== 11}>Pronto!</Button>
                <Button type="submit" variation="ghost">Pular por enquanto</Button>
            </form>
        {:else if step === 4}
            <!-- NOTE: welcome message -->
            <div class="font-rounded mt-4 w-3/4 max-w-96 text-4xl font-bold">
                Parabéns sua conta no rolle já foi criada!
            </div>
            <div class="bg-secondary mt-4 h-2 w-8"></div>
            <div class="mt-4">
                <Button type="button" stretch onclick={() => goto("/")}>Pronto!</Button>
            </div>
        {/if}
    </div>
</div>

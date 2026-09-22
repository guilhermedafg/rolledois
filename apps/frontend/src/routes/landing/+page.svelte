<script lang="ts">
    import { RecordId } from "surrealdb";
    import { Logo, Button, VenueCategoryTag, VENUE_CATEGORIES, HorizontalScroll } from "@rolle/ui";
    import {
        XIcon,
        UserIcon,
        CheckIcon,
        XLogoIcon,
        HouseIcon,
        TiktokLogoIcon,
        RedditLogoIcon,
        MediumLogoIcon,
        CaretRightIcon,
        WhatsappLogoIcon,
        FacebookLogoIcon,
        LinktreeLogoIcon,
        TelegramLogoIcon,
        InstagramLogoIcon,
        ExclamationMarkIcon,
        type IconComponentProps,
    } from "phosphor-svelte";
    import { ListCard } from "$lib/containers";
    import { userStore } from "$lib/store";
    import { toggleSigninModal } from "$lib/modals";
    import type { Component } from "svelte";

    const { data } = $props();
    let socialsWrapperElement: HTMLDivElement | undefined = $state();
    let socialsTranslation = $derived(() => {
        if (typeof socialsWrapperElement === "undefined") return "0px";
        return `${socialsWrapperElement.getBoundingClientRect().height / 2 - 40}px`;
    });

    interface LogoConfig {
        component: Component<IconComponentProps>;
        color: string;
        background: string;
    }

    const logos = [
        { component: XLogoIcon, color: "#ffffff", background: "#000000" },
        { component: InstagramLogoIcon, color: "#ffffff", background: "#F00073" },
        { component: MediumLogoIcon, color: "#000000", background: "#ffffff" },
        { component: TelegramLogoIcon, color: "#ffffff", background: "#0088CC" },
        { component: TiktokLogoIcon, color: "#ffffff", background: "#000000" },
        { component: RedditLogoIcon, color: "#ffffff", background: "#FF4500" },
        { component: WhatsappLogoIcon, color: "#ffffff", background: "#25D366" },
        { component: FacebookLogoIcon, color: "#ffffff", background: "#0064E0" },
        { component: LinktreeLogoIcon, color: "#161616", background: "#4AF366" },
    ] satisfies LogoConfig[];
</script>

<div class="bg-border h-fit min-h-dvh w-full overflow-x-hidden">
    <!-- first section -->
    <div class="relative h-[90dvh] w-full text-center flex flex-col items-center justify-center">
        <div class="absolute inset-0 px-6 py-8">
            <div class="rounded-full bg-white p-4 inline-flex w-full justify-between">
                <Logo class="ml-4 max-w-16" />
                <div class="inline-flex gap-2">
                    <a href="/">
                        <div class="bg-border w-fit rounded-full p-2">
                            <HouseIcon class="size-6" />
                        </div>
                    </a>
                    {#if typeof $userStore !== "undefined"}
                        <a href="/u/{$userStore?.nickname}">
                            <img
                                class="border-border size-10 rounded-full border"
                                src={$userStore?.pictureUrl ||
                                    "https://rolleimages.s3.sa-east-1.amazonaws.com/user/RolleTeste-549ebce1-d686-48fc-89d6-e43154ca0a9a.webp"}
                                alt="Foto de perfil"
                            />
                        </a>
                    {:else}
                        <button type="button" onclick={() => toggleSigninModal()}>
                            <div class="bg-border w-fit rounded-full p-2">
                                <UserIcon class="size-6" />
                            </div>
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <div class="relative flex flex-col px-10 mt-16">
            <img
                src="/landing-icons/bottle.png"
                alt="garrafa"
                class="select-none absolute w-20 -left-10 -top-8 rotate-12 animate-bouncy"
            />
            <img
                src="/landing-icons/tree.png"
                alt="arvore"
                class="select-none absolute w-32 -right-16 -top-12 -rotate-12 animate-bouncy"
            />
            <img
                src="/landing-icons/cup.png"
                alt="xicara"
                class="select-none absolute w-32 -left-10 bottom-0 animate-bouncy"
            />

            <div class="text-5xl leading-12 font-bold tracking-tighter z-10">
                Ajude seus seguidores a descobrir onde você vai
                <span class="text-secondary"> com um link simples.</span>
            </div>

            <div class="mt-6">
                Reúna seus lugares favoritos em listas e compartilhe com todo mundo!
            </div>

            <div class="mt-10 font-semibold">
                <Button
                    type="button"
                    variation="border"
                    outlined
                    onclick={() => toggleSigninModal()}>Crie sua página grátis</Button
                >
            </div>
        </div>
    </div>

    <!-- second section -->
    <div class="overflow-x-clip border-t border-b py-4">
        <div class="animate-scroll-50 inline-flex gap-2">
            {#each [...VENUE_CATEGORIES, ...VENUE_CATEGORIES] as category}
                <VenueCategoryTag
                    active
                    size="lg"
                    categoryId={new RecordId("venueCategory", category)}
                />
            {/each}
        </div>

        <div
            class="animate-scroll-50 mt-4 inline-flex gap-2 [animation-direction:reverse] [animation-delay:-18s]"
        >
            {#each [...VENUE_CATEGORIES, ...VENUE_CATEGORIES] as category}
                <VenueCategoryTag
                    active
                    size="lg"
                    categoryId={new RecordId("venueCategory", category)}
                />
            {/each}
        </div>
    </div>

    <!-- third section -->
    <div class="border-b bg-white py-10">
        <div class="px-10">
            <div class="text-sm">SIMPLES DE CRIAR</div>
            <div class="mt-4 text-4xl font-bold tracking-tighter">
                Crie e customize suas recomendações em minutos
            </div>
            <div class="mt-4">
                Monte listas por vibe, bairro ou ocasião. Adicione fotos, notas pessoais e links
                diretos. Seu guia urbano, do seu jeito.
            </div>
            <div class="mt-8 font-semibold">
                <Button
                    type="button"
                    variation="border"
                    outlined
                    onclick={() => toggleSigninModal()}>Comece agora <CaretRightIcon /></Button
                >
            </div>
        </div>

        <HorizontalScroll class="mt-8 inline-flex gap-2 px-2">
            {#each data.lists.data as list}
                <div class="shrink-0">
                    <ListCard {list} mixpanel={data.mixpanel} />
                </div>
            {/each}
        </HorizontalScroll>
    </div>

    <!-- fourth section -->
    <div class="border-b p-10">
        <div class="text-sm">CONTEÚDO QUE DURA</div>
        <div class="mt-4 text-4xl font-bold tracking-tighter">
            <span class="text-secondary">Transforme </span>
            seus conteúdos em ativos permanentes
        </div>
        <div class="mt-4">
            Com rolle suas recomendações ficam organizadas, acessíveis e sempre atualizadas um link
            que nunca expira.
        </div>

        <div class="mt-8">
            <div class="relative aspect-square w-full">
                <div class="absolute top-1/2 left-1/2 w-24 -translate-1/2">
                    <Logo />
                </div>

                <div bind:this={socialsWrapperElement} class="animate-orbit absolute inset-0">
                    {#each logos as { component: Logo, color, background }, i}
                        <div
                            class="absolute top-1/2 left-1/2 -translate-1/2"
                            style={`
                                --angle: ${i * (360 / logos.length)}deg;
                                transform:
                                  rotate(var(--angle))
                                  translate3d(clamp(100px,${socialsTranslation()}, 240px), 0, 0)
                                  rotate(calc(-1 * var(--angle)));
                                `}
                        >
                            <div
                                class="animate-counter-orbit rounded-lg p-2"
                                style={`color: ${color}; background-color: ${background};`}
                            >
                                <Logo size={24} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="mt-8 flex flex-col gap-4">
            <div class="inline-flex gap-4">
                <div class="bg-white-50 relative h-fit rounded-lg p-4">
                    <div class="font-lg text-4xl font-bold tracking-tighter">70%</div>
                    <div class="mt-4 text-lg">dos Stories desaparecem sem serem vistos</div>
                    <div class="bg-error absolute top-4 right-4 w-fit rounded-full text-white">
                        <ExclamationMarkIcon size={24} />
                    </div>
                </div>
                <div class="bg-white-50 relative h-fit rounded-lg p-4">
                    <div class="font-lg text-4xl font-bold tracking-tighter">85%</div>
                    <div class="mt-4 text-lg">dos posts não são encontrados após 48h</div>
                    <div class="bg-error absolute top-4 right-4 w-fit rounded-full text-white">
                        <ExclamationMarkIcon size={24} />
                    </div>
                </div>
            </div>
            <div class="bg-white-50 relative col-span-2 h-fit rounded-lg p-4 pr-10">
                <!-- <div class="font-lg text-4xl font-bold tracking-tighter">85%</div> -->
                <div class="text-lg">Seus seguidores perguntam as mesmas coisas toda semana.</div>
                <div class="bg-error absolute top-4 right-4 w-fit rounded-full text-white">
                    <ExclamationMarkIcon size={24} />
                </div>
            </div>
        </div>
    </div>

    <!-- fifth section -->
    <div class="border-b bg-white p-10 pb-0 relative">
        <div class="text-sm">EM BREVE</div>
        <div class="mt-4 text-4xl font-bold tracking-tighter">
            Tire insights de engajamento da sua audiência
        </div>
        <div class="mt-4">
            Monte listas por vibe, bairro ou ocasião. Adicione fotos, notas pessoais e links
            diretos. Seu guia urbano, do seu jeito.
        </div>
        <div class="mt-8 font-semibold">
            <Button type="button" variation="border" outlined onclick={() => toggleSigninModal()}
                >Comece agora <CaretRightIcon /></Button
            >
        </div>

        <img src="/landing-icons/list.png" alt="Lista" class="border border-b-0 mt-8 rounded-lg" />
        <div
            class="absolute w-full bottom-0 left-0 h-48 bg-linear-180 from-white/0 via-90% via-white to-white"
        ></div>
    </div>

    <!-- sixth section -->
    <div class="border-b p-10">
        <div class="bg-white-50 rounded-lg border p-4">
            <div class="text-sm">ANTES</div>
            <div class="mt-2 text-4xl font-bold tracking-tighter">Sem rolle</div>

            <div class="mt-4 flex flex-col gap-3">
                {#each ["Respondendo a mesma DM pela centésima vez", "Stories com dicas que somem em 24h", "Seguidores salvando posts que nunca mais acham", "Suas recomendações espalhadas e perdidas"] as point}
                    <div class="inline-flex items-center gap-2">
                        <div class="bg-error size-fit rounded-full p-1 text-white">
                            <XIcon />
                        </div>
                        {point}
                    </div>
                {/each}
            </div>
        </div>

        <div class="bg-white-50 mt-10 rounded-lg border p-4">
            <div class="text-sm">DEPOIS</div>
            <div class="mt-2 text-4xl font-bold tracking-tighter">Com rolle</div>

            <div class="mt-4 flex flex-col gap-3">
                {#each ["Um link. Todas as suas recomendações.", "Listas organizadas que nunca expiram", "Seguidores encontram tudo sozinhos", "Cada recomendação vira um ativo seu"] as point}
                    <div class="inline-flex items-center gap-2">
                        <div class="bg-success size-fit rounded-full p-1 text-white">
                            <CheckIcon />
                        </div>
                        {point}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- seventh section -->
    <div class="relative border-b bg-white p-10 overflow-hidden">
        <div class="mt-4 text-4xl font-bold tracking-tighter">
            <img
                src="/landing-icons/pin.png"
                alt="marcador de mapa"
                class="select-none w-24 -rotate-12 float-right animate-bounce"
            />
            Seu gosto merece um endereço fixo.
        </div>
        <div class="mt-4">
            Crie sua página no Rolle e transforme suas recomendações em algo que dura.
        </div>
        <div class="mt-8 font-semibold">
            <Button type="button" variation="border" outlined onclick={() => toggleSigninModal()}
                >Criar minha página grátis</Button
            >
        </div>

        <div class="h-48"></div>

        <div class="absolute -bottom-16 left-0 -rotate-12 pointer-events-none">
            <ListCard list={data.lists.data[0]} mixpanel={data.mixpanel} />
        </div>
        <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 z-5 pointer-events-none">
            <ListCard list={data.lists.data[1]} mixpanel={data.mixpanel} />
        </div>
        <div class="absolute -bottom-16 right-0 rotate-12 pointer-events-none">
            <ListCard list={data.lists.data[2]} mixpanel={data.mixpanel} />
        </div>
    </div>

    <!-- footer -->
    <footer class="w-full bg-[#262626] p-10">
        <Logo theme="dark" class="w-24" />
        <div class="text-white inline-flex items-center mt-6 justify-between w-full">
            <div class="text-lg tracking-tighter">SEGUIR ROLLE</div>
            <a
                href="https://www.instagram.com/todorolle"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 rounded-full border border-white"
            >
                <InstagramLogoIcon size={24} />
            </a>
        </div>
        <div class="text-white-50 text-sm mt-8 w-full text-center">
            © 2026 Rolle. Todos os direitos reservados.
        </div>
    </footer>
</div>

<style>
    @keyframes orbit {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes counter-orbit {
        to {
            transform: rotate(-360deg);
        }
    }

    @keyframes bouncy {
        0% {
            transform: translate3d(0, 10%, 0);
        }
        50% {
            transform: translate3d(0, 0, 0);
        }
        100% {
            transform: translate3d(0, 10%, 0);
        }
    }

    .animate-orbit {
        animation: orbit 16s linear infinite;
    }

    .animate-counter-orbit {
        animation: counter-orbit 16s linear infinite;
    }

    .animate-bouncy {
        animation: bouncy 3s ease-in-out infinite;
    }

    .animate-bouncy:nth-child(1) {
        animation-delay: 0ms;
        animation-duration: 3s;
    }

    .animate-bouncy:nth-child(2) {
        animation-delay: -1600ms;
        animation-duration: 4s;
    }

    .animate-bouncy:nth-child(3) {
        animation-delay: -2400ms;
        animation-duration: 2s;
    }
</style>

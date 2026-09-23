# guia de implementação do Mixpanel (para o André)

Complementa o `10-plano-de-analytics.md` (o porquê). Aqui está **onde mexer e o que colocar**, arquivo por arquivo.
Base: código do repo `apps/frontend` em set/2026. Os números de linha são aproximados e podem ter mudado.

---

## 0. resumo

**O que existe hoje**: 19 eventos espalhados em ~25 arquivos. O objeto `mixpanel` é passado como prop de componente em componente, e os nomes misturam cliques com telas.

**Problemas encontrados**:
1. **A landing não é medida.** `routes/landing` fica fora do layout `(app)`, onde estão `first_view` e `page_view`. Justamente a página para onde o link "pra criadores" da bio vai apontar.
2. **`page_view` depende do Google Analytics** (`(app)/+layout.svelte:38`). Só dispara se o `gtag` existir.
3. **Não tem `reset()` no logout.** Se duas pessoas usarem o mesmo aparelho, os dados delas se misturam.
4. **O e-mail vai para o Mixpanel** (`people.set_once({ email })`). Não é necessário e aumenta a exposição do ponto de vista da LGPD.
5. **`bookmark` é registrado antes da API confirmar.** Se a chamada falha, o evento conta mesmo assim.
6. **Não há eventos de** cadastro, login, criar lista, adicionar lugar em lista, "já fui", seguir, nem de origem por criador.
7. **`mixpanel.init` roda no `load` de `+layout.ts`**, que também executa no servidor (SSR).
8. O objeto é passado por props em ~20 componentes. O `mixpanel-browser` já é um singleton, então dá para importar direto de um módulo.

**O que fazer (visão geral)**:
1. Criar projetos novos no Mixpanel (dados limpos).
2. Criar **um módulo** `$lib/analytics.ts` com uma função `track` tipada.
3. Registrar as páginas vistas no **layout raiz** (assim a landing entra).
4. Colocar os eventos nas ações, **depois do sucesso da API**, de preferência no `userStore`.
5. Apagar todas as chamadas antigas e a prop `mixpanel`.

---

## 1. Mixpanel: começar limpo
- Em vez de apagar os dados antigos, **crie 2 projetos novos**: `rolle-prod` e `rolle-dev`. O projeto antigo pode ser arquivado depois.
- Copie o **Project Token** de cada um. Ele é público por natureza (vai no navegador), então pode ficar no código.
- Se quiserem, solicitem o **Startup Program** (1º ano grátis no plano pago).

---

## 2. Criar `apps/frontend/src/lib/analytics.ts`

```ts
import mixpanel from "mixpanel-browser";
import { browser, dev } from "$app/environment";

const TOKEN_PROD = "TOKEN_DO_ROLLE_PROD";
const TOKEN_DEV = "TOKEN_DO_ROLLE_DEV";

export type AnalyticsEvent =
    // navegação e conta
    | "page_viewed"
    | "landing_cta_clicked"
    | "signed_up"
    | "logged_in"
    | "logged_out"
    // lado do criador
    | "list_created"
    | "list_edited"
    | "list_deleted"
    | "place_added_to_list"
    | "place_removed_from_list"
    | "list_shared"
    | "profile_shared"
    | "instagram_code_generated"
    // lado do seguidor
    | "profile_viewed"
    | "list_viewed"
    | "place_viewed"
    | "place_saved"
    | "list_saved"
    | "directions_clicked"
    | "place_contact_clicked"
    | "place_shared"
    | "already_been_marked"
    | "creator_followed"
    | "creator_unfollowed"
    | "search_performed";

/** De qual criador/lista a pessoa está vendo lugares agora. */
type Context = { from_creator?: string; from_list_id?: string };

/** Eventos que recebem o contexto automaticamente. */
const CONTEXT_EVENTS: AnalyticsEvent[] = [
    "place_viewed",
    "place_saved",
    "directions_clicked",
    "place_contact_clicked",
    "place_shared",
    "already_been_marked",
];

let initialized = false;
let entryPath: string | undefined;
let context: Context = {};

export const analytics = {
    init() {
        if (!browser || initialized) return;
        mixpanel.init(dev ? TOKEN_DEV : TOKEN_PROD, {
            autocapture: false,
            track_pageview: false,
            persistence: "localStorage",
            debug: dev,
        });
        mixpanel.register({ is_logged_in: false });
        entryPath = window.location.pathname;
        initialized = true;
    },

    track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
        if (!initialized) return;
        const payload = CONTEXT_EVENTS.includes(event) ? { ...context, ...props } : props;
        mixpanel.track(event, payload);
    },

    /** Chamado ao abrir um perfil ou uma lista. */
    setContext(next: Context) {
        context = next;
    },

    /** Grava o criador que trouxe a pessoa, só se for a 1ª página da visita e só na 1ª vez. */
    registerEntryCreator(nickname: string) {
        if (!initialized || window.location.pathname !== entryPath) return;
        mixpanel.register_once({ entry_creator: nickname });
    },

    identify(user: { id: string; nickname: string }) {
        if (!initialized) return;
        mixpanel.identify(user.id);
        mixpanel.people.set({ nickname: user.nickname });
        mixpanel.register({ is_logged_in: true });
    },

    reset() {
        if (!initialized) return;
        mixpanel.reset();
        mixpanel.register({ is_logged_in: false });
        context = {};
    },
};

/** Traduz a rota do SvelteKit para um tipo de página legível. */
export function pageType(routeId: string | null | undefined): string {
    if (!routeId) return "desconhecida";
    if (routeId === "/landing") return "landing";
    if (routeId === "/(app)") return "home";
    if (routeId.includes("/u/[nickname]")) return "perfil";
    if (routeId.includes("/list/[uri]/edit")) return "lista_edicao";
    if (routeId.includes("/list/[uri]")) return "lista";
    if (routeId.includes("/venue/[uri]")) return "lugar";
    if (routeId.includes("/search")) return "busca";
    if (routeId.includes("/category/")) return "categoria";
    if (routeId.includes("/auth/")) return "auth";
    return routeId;
}
```

Notas:
- **UTMs**: o SDK do Mixpanel já guarda os `utm_*` do primeiro acesso por padrão. Não precisa de código.
- **`entry_creator`** usa *first touch*: vale o primeiro criador que trouxe a pessoa naquele aparelho.
- **Contexto**: é "o último perfil ou lista que a pessoa abriu". É simples e resolve bem o começo.

---

## 3. Inicialização e páginas vistas

### 3.1 `src/routes/+layout.ts`: **apagar o arquivo**
Ele só existe para iniciar o Mixpanel. Se o André preferir manter, basta tirar o `mixpanel.init` e o `return { mixpanel }`.

### 3.2 `src/routes/+layout.svelte` (layout raiz, cobre a landing): **adicionar**
```svelte
<script lang="ts">
    import "@rolle/config/style.css";
    import { SigninModal } from "$lib/modals";
    import { browser } from "$app/environment";
    import { afterNavigate } from "$app/navigation";
    import { analytics, pageType } from "$lib/analytics";

    let { children } = $props();

    if (browser) analytics.init();

    afterNavigate(({ to }) => {
        analytics.track("page_viewed", {
            path: to?.url.pathname,
            page_type: pageType(to?.route.id),
        });
    });
</script>
```

### 3.3 `src/routes/(app)/+layout.svelte`: **remover e trocar**
- **Remover** as linhas ~20–21 (`if (dev) data.mixpanel.disable()` e `track("first_view")`). O `if (rolleApi.hasAuthToken) userStore.tryInit()` fica.
- **Remover** o `beforeNavigate` (~25–27, `navigation`). O journey do Mixpanel usa o `page_viewed`.
- **Remover** a linha ~40 (`track("page_view")`). O bloco do `gtag` fica como está.
- **Trocar** o `$effect` do `identify` (~47–53) por:
```ts
$effect(() => {
    if (typeof $userStore === "undefined") return;
    analytics.identify({ id: $userStore.id.toString(), nickname: $userStore.nickname });
});
```

---

## 4. Eventos: onde colocar cada um

Regra: **sempre depois do `await` da API dar certo.**

### 4.1 `src/lib/store/user.ts` (o lugar certo para a maioria)
Importe no topo: `import { analytics } from "$lib/analytics";`

| função | linha ~ | adicionar depois do sucesso |
|---|---|---|
| `signIn` | 42 | `analytics.track("logged_in", { method: "email" });` |
| `signOut` | 51 | `analytics.track("logged_out");` e, depois, `analytics.reset();` (antes do `goto`) |
| `bookmarkVenue` | 67 (depois de `set(updatedUser)`) | `analytics.track("place_saved", { place_id: placeId });` |
| `bookmarkList` | 79 | `analytics.track("list_saved", { list_id: listId });` |
| `alreadyBeen` | 87 | `analytics.track("already_been_marked", { place_id: placeId });` |
| `follow` | 95 | `analytics.track("creator_followed", { creator_id: userId });` |
| `unfollow` | 103 | `analytics.track("creator_unfollowed", { creator_id: userId });` |

⚠️ No cadastro, o `signup` chama `userStore.signIn` em seguida e isso vai gerar também um `logged_in`. Não tem problema: no Mixpanel, é só filtrar. Se preferir evitar, adicionar um parâmetro opcional `{ silent: true }` no `signIn`.

⚠️ Confirmar se `rolleApi.user.bookmarkVenue` é *toggle* (salva e desfaz). Se for, mandar `{ saved: true/false }` conforme o estado.

### 4.2 Cadastro e Google
| arquivo | linha ~ | o quê |
|---|---|---|
| `routes/(app)/auth/signup/+page.svelte` | 104 (depois de `signUp`) | `analytics.track("signed_up", { method: "email" });` |
| `routes/(app)/auth/google/+page.svelte` | 12 | `signed_up` ou `logged_in` com `method: "google"`. Ver abaixo |
| `routes/(app)/auth/signin/+page.svelte` | 25 | igual ao de cima (mesmo fluxo do Google) |

**Precisa de backend**: hoje o front não sabe se o login com Google criou uma conta nova. Em `apps/backend/src/routes/auth.ts` (~246–262), o `if (typeof user === "undefined")` sabe. Basta retornar `isNewUser` junto com o `accessToken`, e adicionar `isNewUser?: boolean` em `AuthResponsePayload` (`packages/api/rolle/types/auth.d.ts`). No front:
```ts
const res = await rolleApi.auth.googleSign({ code: data.code });
analytics.track(res.isNewUser ? "signed_up" : "logged_in", { method: "google" });
```

### 4.3 Listas (lado do criador)
| arquivo | linha ~ | o quê |
|---|---|---|
| `lib/modals/createList.svelte` | 32 (depois do `create`) | `analytics.track("list_created", { list_id: list.id.toString(), is_private: form.values.private });` |
| mesmo arquivo | 35 (depois do `addVenue`) | `analytics.track("place_added_to_list", { list_id: list.id.toString(), place_id: $createListModalState.placeId, source: "create_list" });` |
| `lib/modals/addVenueToList.svelte` | 70 | `analytics.track("place_added_to_list", { list_id: listId, place_id: $addVenueToListModalState.placeId, source: "modal" });` |
| mesmo arquivo | 63 | `analytics.track("place_removed_from_list", { list_id: listId, place_id: ... });` |
| `routes/(app)/(private)/list/[uri]/edit/+page.svelte` | 38 (depois do `update`) | `analytics.track("list_edited", { list_id: list.id.toString() });` |
| mesmo arquivo | 48 (depois do `deleteOne`) | `analytics.track("list_deleted", { list_id: list.id.toString() });` |
| `routes/(app)/list/[uri]/addVenue.svelte` | busca de lugares para adicionar | não precisa de evento próprio: a adição passa pelo `Bookmark` → modal `addVenueToList`, já coberto acima |

### 4.4 Páginas de perfil, lista e lugar (lado do seguidor)
Em cada uma, adicionar um `onMount` (ou `$effect` que reaja à troca de `data`, porque o SvelteKit reaproveita o componente ao navegar entre dois perfis).

**`routes/(app)/u/[nickname]/+page.svelte`**
```ts
$effect(() => {
    const nickname = data.user.nickname;
    analytics.track("profile_viewed", {
        creator: nickname,
        is_own_profile: $userStore?.nickname === nickname,
    });
    analytics.setContext({ from_creator: nickname });
    analytics.registerEntryCreator(nickname);
});
```

**`routes/(app)/list/[uri]/+page.svelte`**
```ts
$effect(() => {
    analytics.track("list_viewed", {
        list_id: list.id.toString(),
        creator: list.owner.nickname,
    });
    analytics.setContext({ from_creator: list.owner.nickname, from_list_id: list.id.toString() });
    analytics.registerEntryCreator(list.owner.nickname);
});
```

**`routes/(app)/venue/[uri]/+page.svelte`**
```ts
$effect(() => {
    // usar data.venue (e não a const `venue`, que não reage quando se navega de um lugar para outro)
    analytics.track("place_viewed", {
        place_id: data.venue.googlePlaceId,
        category: data.venue.category?.toString(),
    });
});
```
E trocar os handlers que já existem na mesma página:

| handler | linha ~ | antes | depois |
|---|---|---|---|
| `handleDirectionClick` | 95 | `click_venue_directions` | `analytics.track("directions_clicked", { place_id: venue.googlePlaceId })` |
| `handleWebsiteClick` | 105 | `click_venue_website` | `analytics.track("place_contact_clicked", { place_id: venue.googlePlaceId, type: "website" })` |
| `handleSocialClick` | 113 | `click_venue_socials` | `analytics.track("place_contact_clicked", { place_id: venue.googlePlaceId, type: social })` |
| `handleShare` | 122 | `click_venue_share` | `analytics.track("place_shared", { place_id: venue.googlePlaceId })` |

### 4.5 Compartilhar, busca, landing e Instagram
| arquivo | linha ~ | antes | depois |
|---|---|---|---|
| `routes/(app)/list/[uri]/+page.svelte` (`handleShare`) | 70 | `click_list_share` | `analytics.track("list_shared", { list_id: list.id.toString(), creator: list.owner.nickname })` |
| `lib/helpers/user.ts` (`handleUserShare`) | 5 | `click_user_share` | `analytics.track("profile_shared", { creator: user.nickname })` e tirar o parâmetro `mixpanel` da função |
| `routes/(app)/search/+page.svelte` | 65 (`emitMixpanelEvent`) | `text_search` | `analytics.track("search_performed", { query })`. Manter o debounce de 3s que já existe, para não mandar um evento a cada letra |
| `routes/landing/+page.svelte` | 116, 163, 257, 317 | nada | antes do `toggleSigninModal()`: `analytics.track("landing_cta_clicked", { position: "hero" })` (depois `"como_funciona"`, `"meio"` e `"final"`) |
| `routes/(app)/(private)/profile/instagram/+page.svelte` | 62 | nada | depois do `generateCode`: `analytics.track("instagram_code_generated")` |

---

## 5. Apagar o antigo

### Eventos a remover (sem substituto direto)
| evento antigo | onde | por quê |
|---|---|---|
| `first_view`, `navigation`, `page_view` | `(app)/+layout.svelte` | substituídos por `page_viewed` no layout raiz |
| `click_venue` | `venueRow.svelte:48`, `venueGalery.svelte:91` | o `place_viewed` na página de destino cobre |
| `click_list` | `listCard.svelte:36` | o `list_viewed` cobre |
| `click_curator` | `userCard.svelte:15`, `userChip.svelte:15` | o `profile_viewed` cobre |
| `click_curator_from_list` | `list/[uri]/+page.svelte:99` | o `profile_viewed` + contexto cobrem |
| `click_list_filter` | `list/[uri]/+page.svelte:61,66` | fora do plano por enquanto |
| `click_user_cities_filter`, `click_user_venues_filter` | `u/[nickname]/+page.svelte:285,304,313` | fora do plano por enquanto |
| `open_home_search` | `search/+page.svelte:45` | fora do plano (o `page_viewed` da busca cobre) |
| `bookmark` | `bookmark.svelte:38`, `venueGalery.svelte:80` | foi para o `userStore` (`place_saved`) |

### Remover a prop `mixpanel` (depois de tirar os `track` antigos)
Tirar `import type { Mixpanel }`, `mixpanel: Mixpanel` dos `Props` e `{mixpanel}` / `mixpanel={data.mixpanel}` de:
`lib/containers/`: `bookmark`, `businessRow`, `listCard`, `userCard`, `userChip`, `venueGalery`, `venueRow` · `lib/modals/addVenueToList` · `lib/helpers/user.ts` · `routes/(app)/`: `+page`, `category/[category]/+page`, `list/[uri]/+page`, `list/[uri]/addVenue`, `list/[uri]/bookmark`, `list/[uri]/venueRow`, `lists/+page`, `search/+page`, `u/[nickname]/+page`, `u/[nickname]/follows/+page`, `users/+page`, `venue/[uri]/+page` · `routes/landing/+page`.

Depois, rodar `npm run check:front` para o TypeScript apontar o que sobrou.

---

## 6. Depois (backend, quando a integração por DM lançar)
Os eventos do Instagram acontecem no servidor (`apps/backend/src/routes/meta.ts`), então precisam do SDK de Node (`npm i mixpanel`) usando o `id` do usuário como `distinct_id`:
- `instagram_linked`: em `handleCode`, quando vincula a conta.
- `post_sent_via_dm`: no começo de `handlePlacesFromInstagram`.
- `places_extracted` (`count`) e `places_saved_via_dm` (`count`): no fim de `handlePlacesFromInstagram`.

---

## 7. Como testar
1. Rodar local com o token `rolle-dev` (é o que o `dev` do SvelteKit usa).
2. Com `debug: dev`, cada evento aparece no console do navegador.
3. No Mixpanel, abrir **Events** para ver os eventos chegando em tempo real.
4. Roteiro de teste, em aba anônima:
   - abrir `/landing?utm_source=instagram` → clicar no CTA → cadastrar
   - abrir o perfil de alguém → abrir uma lista → abrir um lugar → salvar → "como chegar"
   - no Mixpanel, abrir o usuário e conferir se a sequência tem `utm_source`, `entry_creator`, `from_creator` e `from_list_id`
5. Fazer logout e conferir se o próximo evento sai sem `identify` (anônimo).

## 8. Checklist
- [ ] Projetos `rolle-prod` e `rolle-dev` criados, tokens no `analytics.ts`
- [ ] `lib/analytics.ts` criado
- [ ] `routes/+layout.ts` apagado e `init` + `page_viewed` no layout raiz
- [ ] `(app)/+layout.svelte` limpo e `identify` novo
- [ ] Eventos do `userStore` (login, logout + reset, salvar, "já fui", seguir)
- [ ] Cadastro por e-mail e Google (backend com `isNewUser`)
- [ ] Listas: criar, editar, apagar, adicionar e remover lugar
- [ ] Views: perfil, lista e lugar, com contexto e `entry_creator`
- [ ] Compartilhar, busca, CTAs da landing, código do Instagram
- [ ] Eventos antigos e prop `mixpanel` removidos; `npm run check:front` sem erro
- [ ] Roteiro de teste da seção 7 ok

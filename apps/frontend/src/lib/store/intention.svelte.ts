import type { Component } from "svelte";
import {
    Barbell,
    BeerStein,
    BowlFood,
    Bread,
    Cheers,
    Clock,
    Coffee,
    Cookie,
    DiscoBall,
    Footprints,
    Laptop,
    MaskHappy,
    PersonSimpleRun,
    type IconComponentProps,
} from "phosphor-svelte";
import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
import type { DaysOfTheWeek } from "@rolle/ui";

export type Intention =
    | "work"
    | "workout_weekday"
    | "workout_weekend"
    | "coffee_morning"
    | "coffee_afternoon"
    | "breakfast"
    | "lunch"
    | "dinner_weekday"
    | "dinner_weekend"
    | "dessert"
    | "culture_night"
    | "24hrs"
    | "drink"
    | "drink_monday"
    | "happyhour"
    | "party"
    | "stroll"
    | "sports_practice";

interface IntentionDisplay {
    label: string;
    icon: Component<IconComponentProps>;
    listsUri: Array<string>;
}

interface Period {
    greetings: string;
    start: { hour: number; minutes: number };
    end: { hour: number; minutes: number };
    intentions: Array<Intention>;
}

export type Periods = Record<DaysOfTheWeek, Array<Period>>;

export const intentions: Record<Intention, IntentionDisplay> = {
    work: {
        icon: Laptop,
        label: "Trabalhar",
        listsUri: [
            "cafes-calmos-e-com-luz-natural-38551766-3e58-432a-b7ab-df8c511d2510",
            "cabine-sala-privativa-call-sem-ruido-02fedb7f-9d31-4d72-9168-f63030e6b372",
            "wi-fi-tomadas-garantidas-3e2ab128-9baa-4755-9e2c-51f3a521be9d",
            "coworkings-bibliotecas-gratis-204d9b7d-dbad-4469-9e4c-36762c3e36c7",
            "day-use-pra-trabalhar-a35c83cd-74bf-4d75-b922-63fb8802e5b6",
        ],
    },
    workout_weekday: {
        icon: Barbell,
        label: "Exercitar",
        listsUri: [
            "cafes-parques-em-curitiba-47e7d080-31cc-4847-9f05-aae63264b465",
            "pedal-leve-de-manha-a6120522-7cc7-40f9-b4f2-307ebc7d2b6c",
            "cardio-ao-ar-livre-d7c8e95d-67de-486e-bf98-31c60b720777",
            "tenis-0800-quadras-publicas-1c9ebed0-1b3e-4fae-9c74-35962bc746cc",
            "calistenia-ao-ar-livre-a4eeb68c-8552-4af2-a38e-e5f8861ead98",
        ],
    },
    workout_weekend: {
        icon: Barbell,
        label: "Exercitar",
        listsUri: [
            "yoga-em-parques-935b26c9-0c21-452f-8b94-63059f8a856a",
            "cafes-parques-em-curitiba-47e7d080-31cc-4847-9f05-aae63264b465",
            "pedal-leve-de-manha-a6120522-7cc7-40f9-b4f2-307ebc7d2b6c",
            "cardio-ao-ar-livre-d7c8e95d-67de-486e-bf98-31c60b720777",
            "tenis-0800-quadras-publicas-1c9ebed0-1b3e-4fae-9c74-35962bc746cc",
            "calistenia-ao-ar-livre-a4eeb68c-8552-4af2-a38e-e5f8861ead98",
        ],
    },
    coffee_morning: {
        icon: Coffee,
        label: "Tomar um café",
        listsUri: [
            "excelencia-em-cafe-7039bdf3-46b6-4f2b-bcad-93401529ecde",
            "cafes-que-abrem-cedo-da67c115-6169-4e85-82fd-368b7a4526ce",
            "letras-e-cafeina-b3a56e45-3eb6-4388-a90b-580df8b7cad0",
            "cafes-parques-em-curitiba-47e7d080-31cc-4847-9f05-aae63264b465",
            "cafes-aconchegantes-2d4b4c36-239c-4729-9383-1db839a46297",
        ],
    },
    coffee_afternoon: {
        icon: Coffee,
        label: "Tomar um café",
        listsUri: [
            "excelencia-em-cafe-7039bdf3-46b6-4f2b-bcad-93401529ecde",
            "letras-e-cafeina-b3a56e45-3eb6-4388-a90b-580df8b7cad0",
            "cafes-parques-em-curitiba-47e7d080-31cc-4847-9f05-aae63264b465",
            "cafes-aconchegantes-2d4b4c36-239c-4729-9383-1db839a46297",
        ],
    },
    breakfast: {
        icon: Bread,
        label: "Comer algo",
        listsUri: [
            "cafe-da-manha-brunch-da2c835a-4f1f-42d1-bdcd-ca90ce584529",
            "paes-artesanais-79dd4880-4202-4efb-9d23-4e3f9642dca6",
            "pao-na-chapa-e-pingado-d1684ff1-6b54-46ac-b396-9b8435174539",
            "padarias-bem-conceituadas-89fb8d3e-8739-4c47-a866-f8556001af58",
            "sucos-vitaminas-acai-no-cafe-a95db791-913b-42b7-999c-588b9f3fc7f4",
            "com-criancas-cafe-em-familia-d4d0c654-2748-4333-a1d2-b1bd059cb9ea",
            "proteico-de-manha-ovos-bowls-95e4c8df-608f-4031-8075-f95105041c94",
        ],
    },
    lunch: {
        icon: BowlFood,
        label: "Almoçar",
        listsUri: [
            "sabores-do-mundo-e8005838-23bd-423f-bccf-4c95759d97ff",
            "opcoes-veganas-e-vegetarianas-c4d72962-1855-43dc-873c-3f95336494f3",
            "buffet-por-quilo-campeao-14148445-2dd2-4a87-b75f-aeb407f84bee",
            "menu-executivo-ate-45-min-servico-continuo-3bb647f8-a4d8-4920-be31-9059fca1c025",
            "almocos-no-centro-de-curitiba-bd71d1ae-5c13-46d7-8f66-247fd0736691",
            "italianos-classicos-para-conversar-3427705b-32b6-4e49-a84f-4f02d215d1a5 ",
        ],
    },
    dinner_weekday: {
        icon: BowlFood,
        label: "Jantar",
        listsUri: [
            "sabores-do-mundo-e8005838-23bd-423f-bccf-4c95759d97ff",
            "opcoes-veganas-e-vegetarianas-c4d72962-1855-43dc-873c-3f95336494f3",
            "izakayas-donburis-47b2b5c8-15da-403b-9b20-bc7d69162e1e",
            "jantar-pos-expediente-rapido-9b91a977-18ba-4139-a147-ec63f2149461",
            "bistros-autorais-aconchegantes-13541549-44ac-47a7-a4dc-cbb9b2a7a097",
            "jantar-leve-de-semana-72bdb040-e027-43be-a52b-e94f25ab7d08",
            "italianos-classicos-para-conversar-3427705b-32b6-4e49-a84f-4f02d215d1a5",
            "arabe-mediterraneo-na-janta-7415aca8-5ac5-4d6d-b988-4c969f9eed50",
            "hamburguer-smash-da-semana-68c28ca1-4e2e-477a-9852-5af10d6f439a",
        ],
    },
    dinner_weekend: {
        icon: BowlFood,
        label: "Jantar",
        listsUri: [
            "sabores-do-mundo-e8005838-23bd-423f-bccf-4c95759d97ff",
            "opcoes-veganas-e-vegetarianas-c4d72962-1855-43dc-873c-3f95336494f3",
            "izakayas-donburis-47b2b5c8-15da-403b-9b20-bc7d69162e1e",
            "bistros-autorais-aconchegantes-13541549-44ac-47a7-a4dc-cbb9b2a7a097",
            "jantar-leve-de-semana-72bdb040-e027-43be-a52b-e94f25ab7d08",
            "italianos-classicos-para-conversar-3427705b-32b6-4e49-a84f-4f02d215d1a5",
            "arabe-mediterraneo-na-janta-7415aca8-5ac5-4d6d-b988-4c969f9eed50",
            "hamburguer-smash-da-semana-68c28ca1-4e2e-477a-9852-5af10d6f439a",
        ],
    },
    dessert: {
        icon: Cookie,
        label: "Comer um doce",
        listsUri: [
            "sorvetes-artesanais-7872adc5-f176-4340-8cfd-01d297093c93",
            "docerias-premiadas-2024-2025-34f1b145-355e-4b7a-928b-0ac1dce2d3df",
            "pos-almoco-docinho-14cf14f3-d58c-4101-bf06-d0825cd992d5",
            "brigadeiro-e-brownie-express-67b8f71d-6012-457e-8956-5f3103c86123",
            "zero-lactose-e-sem-acucar-e539dfdf-da5b-4d44-82ed-d07bbb53d54f",
        ],
    },
    culture_night: {
        icon: MaskHappy,
        label: "Encontrar cultura",
        listsUri: [
            "musica-ao-vivo-erudito-mpb-pubs-35e65532-021a-4ea1-9ba0-0a2158b1b31a",
            "palcos-pecas-teatro-no-horario-nobre-b0268fd5-3f0b-4d14-8da7-04123f8bba12",
            "cinema-de-arte-18h-23h-c995be2d-5e0e-4f9d-8478-90c7fd04b883",
        ],
    },
    ["24hrs"]: {
        icon: Clock,
        label: "Encontrar algo aberto",
        listsUri: [
            "restaurantes-abertos-na-madrugada-11fdb45a-755c-494c-b7a0-26fbdb800fb2",
            "24h-na-cidade-mercados-mais-95354168-1830-4dd8-bbd0-af6f35551303 ",
        ],
    },
    drink: {
        icon: Clock,
        label: "Beber algo",
        listsUri: [
            "botecos-classicow-76699b16-984a-4e0b-a7b2-2205cb56bb6c ",
            "restaurantes-com-carta-de-vinhos-reconhecida-419a95b5-c88a-4b64-9b48-bef58d0b0816 ",
            "cerveja-artesanal-1ce87436-0ac9-426a-aafd-f712d4068382 ",
            "bares-de-coquetelaria-autorais-551a78ba-7977-4851-97c3-cbaf5a1cef6a ",
            "wine-bars-0f6349a7-4bf9-44c6-8c37-e000b5dcaeb3",
        ],
    },
    drink_monday: {
        icon: BeerStein,
        label: "Beber algo",
        listsUri: [
            "bares-abrem-a-partir-de-segunda-3b5696f7-8458-470e-94a7-c9c76bd48800,",
            "botecos-classicow-76699b16-984a-4e0b-a7b2-2205cb56bb6c ",
            "restaurantes-com-carta-de-vinhos-reconhecida-419a95b5-c88a-4b64-9b48-bef58d0b0816 ",
            "cerveja-artesanal-1ce87436-0ac9-426a-aafd-f712d4068382 ",
            "bares-de-coquetelaria-autorais-551a78ba-7977-4851-97c3-cbaf5a1cef6a ",
            "wine-bars-0f6349a7-4bf9-44c6-8c37-e000b5dcaeb3",
        ],
    },
    happyhour: {
        icon: Cheers,
        label: "Happy hour",
        listsUri: [
            "jantar-pos-expediente-rapido-9b91a977-18ba-4139-a147-ec63f2149461",
            "hh-17h30-20h30-bons-goles-e-petiscos-5414d93f-40d8-4eb4-abce-588ba0b04664",
            "botecos-classicow-76699b16-984a-4e0b-a7b2-2205cb56bb6c ",
            "restaurantes-com-carta-de-vinhos-reconhecida-419a95b5-c88a-4b64-9b48-bef58d0b0816 ",
            "cerveja-artesanal-1ce87436-0ac9-426a-aafd-f712d4068382 ",
            "bares-de-coquetelaria-autorais-551a78ba-7977-4851-97c3-cbaf5a1cef6a",
        ],
    },
    party: {
        icon: DiscoBall,
        label: "Curtir a noite",
        listsUri: [
            "bares-com-cara-de-brasil-d3d49a49-6180-4e93-b0ae-ee8efcc9811c ",
            "bares-com-jogos-02cf9e4e-40fc-4586-9e06-6ded95916a81",
            "sinuca-8ff581b1-5abe-4048-88de-7fc478f596d4 ",
            "vistas-da-cidade-bf8bc734-f826-4b52-baa4-baa0ee8f23ad",
            "palco-aberto-todo-dia-musica-ao-vivo-0aebd5b2-4106-4359-81f9-7710b9fc080d ",
            "listening-bars-61093cae-f98f-4167-aa15-34d936783cd5 ",
            "clubs-pistas-5becbd32-499b-4397-8a6d-6b2b1c1f7c87",
            "bares-cozinhas-ffafee7a-77c6-4420-9bed-ccd6a2264810 ",
        ],
    },
    stroll: {
        icon: Footprints,
        label: "Passear",
        listsUri: [
            "lojas-de-vinil-56d5f43f-1cb2-44f4-b4fd-561c63545469 ",
            "lojas-de-som-hi-fi-e-vintage-feb4ea5e-249f-405c-986e-dd5a1e2c1e15",
            "laboratorios-de-fotografia-f65c3a31-a25f-4705-b300-e9af208b9474",
            "lojas-de-garimpo-e-antiguidades-fc719f56-acde-43ca-b9b5-7c30c549f394",
            "lojas-de-roupas-autorais-1fa4f781-9e62-4df5-b0ea-2a858da5131f",
            "loja-de-moveis-autorais-38eeb381-5116-4668-94b4-e3f50b299490",
            "lojas-de-decoracao-autoral-e30e1ae3-c627-41a1-ae42-f68cbf861549",
            "livrarias-de-rua-7f8cb3c0-6902-4e84-98ad-88eb0b83d4a6",
            "torrefacoes-chocolaterias-frios-e-mais-2971be05-bb73-4696-9932-7d960fcddc04 ",
            "charme-no-centro-historico-c0d6a902-a621-46e9-84c0-ab089f28d7fa",
        ],
    },
    sports_practice: {
        icon: PersonSimpleRun,
        label: "Praticar um esporte",
        listsUri: [
            "pistas-de-skate-street-bowl-8451e78f-4432-4da1-ac51-9326393da85b",
            "quadras-publicas-de-futebol-bf9556af-47ed-4466-9107-d7d6cc6588c4",
            "quadras-publicas-de-basquete-3a00a895-3808-4455-9b88-1344b9facef4",
            "quadras-publicas-de-basquete-3a00a895-3808-4455-9b88-1344b9facef4 ",
            "quadras-publicas-de-volei-f821c3df-b525-4a4c-b551-37bf654f2906 ",
            "tenis-0800-quadras-publicas-1c9ebed0-1b3e-4fae-9c74-35962bc746cc",
            "pedal-leve-de-manha-a6120522-7cc7-40f9-b4f2-307ebc7d2b6c",
        ],
    },
};

const weekdayPeriods: Array<Period> = [
    {
        greetings: "Bom dia",
        start: { hour: 6, minutes: 0 },
        end: { hour: 10, minutes: 59 },
        intentions: ["coffee_morning", "workout_weekday", "breakfast", "work"],
    },
    {
        greetings: "Bom dia",
        start: { hour: 11, minutes: 0 },
        end: { hour: 13, minutes: 59 },
        intentions: ["lunch", "dessert", "coffee_afternoon"],
    },
    {
        greetings: "Boa tarde",
        start: { hour: 14, minutes: 0 },
        end: { hour: 16, minutes: 59 },
        intentions: ["work", "coffee_afternoon", "dessert"],
    },
    {
        greetings: "Boa tarde",
        start: { hour: 17, minutes: 0 },
        end: { hour: 19, minutes: 59 },
        intentions: ["happyhour", "dinner_weekday", "dessert", "culture_night", "drink"],
    },
    {
        greetings: "Boa noite",
        start: { hour: 20, minutes: 0 },
        end: { hour: 22, minutes: 59 },
        intentions: ["dinner_weekday", "dessert", "culture_night", "drink"],
    },
    {
        greetings: "Boa noite",
        start: { hour: 23, minutes: 0 },
        end: { hour: 5, minutes: 59 },
        intentions: ["24hrs"],
    },
];

const weekendPeriods: Array<Period> = [
    {
        greetings: "Bom dia",
        start: { hour: 6, minutes: 0 },
        end: { hour: 10, minutes: 59 },
        intentions: ["coffee_morning", "breakfast", "workout_weekend", "stroll", "sports_practice"],
    },
    {
        greetings: "Bom dia",
        start: { hour: 11, minutes: 0 },
        end: { hour: 13, minutes: 59 },
        intentions: ["lunch", "dessert", "coffee_afternoon", "stroll", "sports_practice"],
    },
    {
        greetings: "Boa tarde",
        start: { hour: 14, minutes: 0 },
        end: { hour: 17, minutes: 59 },
        intentions: ["stroll", "sports_practice", "dessert", "coffee_afternoon"],
    },
    {
        greetings: "Boa noite",
        start: { hour: 18, minutes: 0 },
        end: { hour: 20, minutes: 59 },
        intentions: ["dinner_weekend", "culture_night", "party", "drink", "dessert"],
    },
    {
        greetings: "Boa noite",
        start: { hour: 21, minutes: 0 },
        end: { hour: 5, minutes: 59 },
        intentions: ["party", "drink", "24hrs"],
    },
];

const sundayPeriods: Array<Period> = [
    {
        greetings: "Bom dia",
        start: { hour: 6, minutes: 0 },
        end: { hour: 10, minutes: 59 },
        intentions: ["coffee_morning", "breakfast", "workout_weekend", "stroll", "sports_practice"],
    },
    {
        greetings: "Bom dia",
        start: { hour: 11, minutes: 0 },
        end: { hour: 13, minutes: 59 },
        intentions: ["lunch", "dessert", "coffee_afternoon", "stroll", "sports_practice"],
    },
    {
        greetings: "Boa tarde",
        start: { hour: 14, minutes: 0 },
        end: { hour: 17, minutes: 59 },
        intentions: ["stroll", "sports_practice", "dessert", "coffee_afternoon"],
    },
    {
        greetings: "Boa noite",
        start: { hour: 18, minutes: 0 },
        end: { hour: 20, minutes: 59 },
        intentions: ["dinner_weekend", "culture_night", "drink", "dessert"],
    },
    {
        greetings: "Boa noite",
        start: { hour: 21, minutes: 0 },
        end: { hour: 5, minutes: 59 },
        intentions: ["24hrs"],
    },
];

const periods: Periods = {
    monday: weekdayPeriods,
    tuesday: weekdayPeriods,
    wednesday: weekdayPeriods,
    thursday: weekdayPeriods,
    friday: weekdayPeriods,
    saturday: weekendPeriods,
    sunday: sundayPeriods,
};

export const currentPeriodStore: Writable<Period> = writable(getPeriod());
export const intentionSelectedStore: Writable<Intention> = writable(getPeriod().intentions[0]);

function getPeriod() {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })
        .format(now)
        .toLocaleLowerCase() as DaysOfTheWeek;

    if (!browser) {
        now.setHours(now.getHours() - 3);
    }

    const hourMinutes = { hour: now.getHours(), minutes: now.getMinutes() };

    const period = periods[weekday].find((p) => {
        if (hourMinutes.hour >= p.start.hour && hourMinutes.hour <= p.end.hour) {
            return true;
        }
        return false;
    });

    if (typeof period === "undefined") {
        return {
            greetings: "Olá",
            start: { hour: 0, minutes: 0 },
            end: { hour: 0, minutes: 0 },
            intentions: Object.keys(intentions) as Intention[],
        } satisfies Period;
    }

    return period;
}

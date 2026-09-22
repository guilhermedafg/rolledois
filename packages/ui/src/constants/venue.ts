import {
    Asterisk,
    BeerStein,
    Bread,
    Coffee,
    DiscoBall,
    ForkKnife,
    MapPinSimple,
    Martini,
    Park,
    Pizza,
    type IconComponentProps,
} from "phosphor-svelte";
import type { Component } from "svelte";
import type { Venue } from "@rolle/types";

export type VenueCategoryMapped =
    | "todos"
    | "restaurante"
    | "pizaria"
    | "parque"
    | "bar"
    | "bistro"
    | "cafe"
    | "padaria"
    | "discoteca"
    | "default";

export const VENUE_CATEGORY_TO_TEXT = {
    ["todos"]: "Todos",
    ["restaurante"]: "Restaurante",
    ["pizaria"]: "Pizaria",
    ["parque"]: "Parque",
    ["bar"]: "Bar",
    ["bistro"]: "Bistro",
    ["cafe"]: "Café",
    ["padaria"]: "Padaria",
    ["discoteca"]: "Discoteca",
    ["default"]: "",
} satisfies Record<VenueCategoryMapped, string>;

export const VENUE_CATEGORY_TO_TEXT_PLURAL = {
    ["todos"]: "Todos",
    ["restaurante"]: `${VENUE_CATEGORY_TO_TEXT["restaurante"]}s`,
    ["pizaria"]: `${VENUE_CATEGORY_TO_TEXT["pizaria"]}s`,
    ["parque"]: `${VENUE_CATEGORY_TO_TEXT["parque"]}s`,
    ["bar"]: `${VENUE_CATEGORY_TO_TEXT["bar"]}es`,
    ["bistro"]: `${VENUE_CATEGORY_TO_TEXT["bistro"]}s`,
    ["cafe"]: `${VENUE_CATEGORY_TO_TEXT["cafe"]}s`,
    ["padaria"]: `${VENUE_CATEGORY_TO_TEXT["padaria"]}s`,
    ["discoteca"]: `${VENUE_CATEGORY_TO_TEXT["discoteca"]}s`,
    ["default"]: "",
} satisfies Record<VenueCategoryMapped, string>;

export const VENUE_CATEGORY_TO_DESCRIPTION = {
    ["todos"]: "",
    ["restaurante"]: "Restaurantes para almoços e jantares",
    ["pizaria"]: "Pizzarias para dividir e pedir em dupla",
    ["parque"]: "Parques para caminhar e relaxar",
    ["bar"]: "Bares para drinks, petiscos e papo",
    ["bistro"]: "Bistrôs e cozinhas autorais",
    ["cafe"]: "Cafés para trabalhar, ler e encontrar",
    ["padaria"]: "Padarias para café da manhã e lanches",
    ["discoteca"]: "Pistas, clubes e festas para dançar",
    ["default"]: "",
} satisfies Record<VenueCategoryMapped, string>;

export const VENUE_CATEGORY_TO_COLOR = {
    ["todos"]: "#EEFD96",
    ["restaurante"]: "#FEBA87",
    ["pizaria"]: "#FFB6A9",
    ["parque"]: "#9BC385",
    ["bar"]: "#E2C7F1",
    ["bistro"]: "#D0F1CB",
    ["cafe"]: "#FDF6B7",
    ["padaria"]: "#F1E4D5",
    ["discoteca"]: "#B5D8DB",
    ["default"]: "#CACFF4",
} satisfies Record<VenueCategoryMapped, string>;

export const VENUE_CATEGORY_TO_ICON = {
    ["todos"]: Asterisk,
    ["restaurante"]: ForkKnife,
    ["pizaria"]: Pizza,
    ["parque"]: Park,
    ["bar"]: BeerStein,
    ["bistro"]: Martini,
    ["cafe"]: Coffee,
    ["padaria"]: Bread,
    ["discoteca"]: DiscoBall,
    ["default"]: MapPinSimple,
} satisfies Record<VenueCategoryMapped, Component<IconComponentProps>>;

export const VENUE_CATEGORIES = Object.keys(VENUE_CATEGORY_TO_TEXT).filter(
    (c) => c !== "default" && c !== "todos",
) as VenueCategoryMapped[];

export type DaysOfTheWeek = keyof NonNullable<Venue["workingHours"]>;
export const VENUE_DAYS_OF_THE_WEEK_TO_TEXT: Record<DaysOfTheWeek, string> = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
};

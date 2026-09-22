import { tw } from "../../utils";

export type TextfieldColor = "primary";
export type TextfieldStatus = "valid" | "warning" | "error";

export const inputClasses: Record<TextfieldStatus, string> = {
    valid: tw`border-text`,
    warning: tw`!focus:border-warning !border-warning`,
    error: tw`!focus:border-error !border-error`,
};

export const inputColors: Record<TextfieldColor, string> = {
    primary: tw`focus:ring-2 focus:ring-transparent`,
};

import type { FieldValue } from "../field";

export type ValidatorMessage = string | ((value: FieldValue) => string);
export type ValidatorFn<Value> = (value: Value) => Promise<[boolean, string]> | [boolean, string];
export type HOFValidatorFn<Value> = (...args: any) => ValidatorFn<Value>;

/**
 * Resolves error message.
 */
function resolveMessage(
    value: FieldValue,
    defaultMessage: ValidatorMessage,
    message?: ValidatorMessage,
): string {
    if (message) {
        if (typeof message === "string") return message;
        if (typeof message === "function") return message(value);
    }

    if (typeof defaultMessage === "string") return defaultMessage;
    if (typeof defaultMessage === "function") return defaultMessage(value);

    throw new Error("Something went wrong...");
}

/**
 * Validates if the field has any type of value.
 */
export const required: ValidatorFn<string | number | boolean> = (value) => {
    const resolvedMessage = resolveMessage(value, "Campo obrigatório.");

    if (typeof value === "string") {
        return [value.length !== 0, resolvedMessage];
    } else if (typeof value === "number") {
        return [value !== 0, resolvedMessage];
    } else if (typeof value === "boolean") {
        return [value, resolvedMessage];
    }

    return [value, resolvedMessage];
};

/**
 * Validates if the length of a string is greater then min length.
 */
export const min: HOFValidatorFn<string> = (minLength: number, message?: ValidatorMessage) => {
    return (value) => {
        const resolvedMessage = resolveMessage(
            value,
            `Precisa ser maior que ${minLength} caracteres.`,
            message,
        );

        if (value.length < minLength) {
            return [false, resolvedMessage];
        }

        return [true, resolvedMessage];
    };
};

/**
 * Validates if the length of a string is less than max length.
 */
export const max: HOFValidatorFn<string> = (maxLength: number, message?: ValidatorMessage) => {
    return (value) => {
        const resolvedMessage = resolveMessage(
            value,
            `Precisa ser menor que ${maxLength} caracteres.`,
            message,
        );

        if (value.length > maxLength) {
            return [false, resolvedMessage];
        }

        return [true, resolvedMessage];
    };
};

/**
 * Validates if the value is a valid Email.
 */
export const email: ValidatorFn<string> = (value: string) => {
    const regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return [regex.test(value), resolveMessage(value, "Email inválido.")];
};

/**
 * Validates if the value is a valid CPF.
 */
export const cpf: ValidatorFn<string> = (value: string) => {
    const resolvedMessage = resolveMessage(value, "CPF inválido.");

    let sum = 0;
    let rest: number;

    if (
        value.length !== 11 ||
        value === "00000000000" ||
        value === "11111111111" ||
        value === "22222222222" ||
        value === "33333333333" ||
        value === "44444444444" ||
        value === "55555555555" ||
        value === "66666666666" ||
        value === "77777777777" ||
        value === "88888888888" ||
        value === "99999999999"
    ) {
        return [false, resolvedMessage];
    }

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(value.substring(i - 1, i), 10) * (11 - i);
    }

    rest = sum % 11;

    if (rest === 10 || rest === 11 || rest < 2) {
        rest = 0;
    } else {
        rest = 11 - rest;
    }

    if (rest !== parseInt(value.substring(9, 10), 10)) {
        return [false, resolvedMessage];
    }

    sum = 0;

    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(value.substring(i - 1, i), 10) * (12 - i);
    }
    rest = sum % 11;

    if (rest === 10 || rest === 11 || rest < 2) {
        rest = 0;
    } else {
        rest = 11 - rest;
    }

    if (rest !== parseInt(value.substring(10, 11), 10)) {
        return [false, resolvedMessage];
    }

    return [true, resolvedMessage];
};

/**
 * Validates if an email is already taken.
 */
export const checkEmail: HOFValidatorFn<string> = (
    validatorFn: (email: string) => Promise<boolean>,
) => {
    return async (value: string) => {
        const resolvedMessage = resolveMessage(value, "Email indisponível.");
        const result = await validatorFn(value);

        return [!result, resolvedMessage];
    };
};

/**
 * Validates if an cpf is already taken.
 */
export const checkCpf: HOFValidatorFn<string> = (
    validatorFn: (cpf: string) => Promise<boolean>,
) => {
    return async (value: string) => {
        const resolvedMessage = resolveMessage(value, "CPF indisponível.");
        const result = await validatorFn(value);

        return [!result, resolvedMessage];
    };
};

/**
 * Validates if a string has whitespaces.
 */
export const checkNoWhitespace: ValidatorFn<string> = (value) => {
    const resolvedMessage = resolveMessage(value, "Não deve conter espaço.");

    return [!/\s/g.test(value), resolvedMessage];
};

export type Mask = (value: string) => [maskedValue: string, originalValue: any];

export const cpf: Mask = (value: string) => {
    return [
        value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1"),
        value.replace(/\D/g, "").replace(/[.-]/g, "").substring(0, 11),
    ];
};

export const cellphone: Mask = (value: string) => {
    return [
        value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .replace(/(-\d{4})(\d+?)$/, "$1"),
        value
            .replace(/\D/g, "")
            .replace(/\(|\)|\s|-/g, "")
            .substring(0, 11),
    ];
};

export const zipCode: Mask = (value: string) => {
    return [
        value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .substring(0, 9),
        value.replace(/\D/g, "").replace(/-/g, "").substring(0, 8),
    ];
};

export const number: Mask = (value: string) => {
    return [value.replace(/\D/g, ""), parseInt(value.replace(/\D/g, ""), 10)];
};

export const currency: Mask = (value: string) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const formattedValue = value
        ? formatter.format(parseFloat(value.replace(/\D/g, "")) / 100)
        : formatter.format(0);
    return [
        formattedValue,
        parseFloat(formattedValue.replaceAll(".", "").replace(",", ".").split(/\s/)[1]) * 100,
    ];
};

export const dayMonth: Mask = (value: string) => {
    return [
        value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/g, "$1/$2")
            .substring(0, 5),
        value.replace(/\D/g, ""),
    ];
};

export const cvv: Mask = (value: string) => {
    return [value.replace(/\D/g, "").substring(0, 4), value.replace(/\D/g, "")];
};

/**
 * Removes accents/diacritics from the input string.
 */
export function removeAccents(str: string) {
    return (
        str
            // 1. Decompose combined letters into letter + diacritic
            .normalize("NFD")
            // 2. Remove all diacritic marks
            .replace(/[\u0300-\u036f]/g, "")
    );
}

/**
 * Vaidates if a string is an http/https url.
 */
export function isHttpUrl(str: string): boolean {
    try {
        const url = new URL(str);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export function toNickname(input: string): string {
    return input
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s-]/g, "_")
        .replace(/[^a-zA-Z._]+/g, "");
}

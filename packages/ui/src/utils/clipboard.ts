export async function copyToClipboard(text: string) {
    if (
        typeof navigator.clipboard !== "undefined" &&
        typeof navigator.clipboard.writeText !== "undefined"
    ) {
        await navigator.clipboard.writeText(text);
    }
}

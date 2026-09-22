export function tw(strings: TemplateStringsArray) {
    const lastIndex = strings.length - 1;
    return (
        strings.slice(0, lastIndex).reduce((acc, str) => {
            return acc + str;
        }, "") + strings[lastIndex]
    );
}

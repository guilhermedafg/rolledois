export function useBlockScroll(shouldBlock: () => boolean) {
    $effect(() => {
        if (shouldBlock()) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.removeProperty("overflow");
        }
    });
}

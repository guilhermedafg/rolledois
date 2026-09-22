export const signinModalState = $state({
    open: false,
    title: "Não perca o timing do Rolle — descubra lugares que valem a pena.",
    subtitle: "",
});

export function toggleSigninModal(opts?: { title: string; subtitle?: string }) {
    if (typeof opts !== "undefined") {
        signinModalState.title = opts.title;
        signinModalState.subtitle = opts.subtitle ?? "";
    }

    signinModalState.open = !signinModalState.open;
}

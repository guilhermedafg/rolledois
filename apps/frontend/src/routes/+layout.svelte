<script lang="ts">
    import "@rolle/config/style.css";
    import { SigninModal } from "$lib/modals";

    let { children } = $props();
</script>

<svelte:head>
    <!-- Light theme -->
    <link
        rel="icon"
        type="image/svg+xml"
        href="/faviconLightTheme.svg"
        media="(prefers-color-scheme: light)"
    />

    <!-- Dark theme -->
    <link
        rel="icon"
        type="image/svg+xml"
        href="/faviconDarkTheme.svg"
        media="(prefers-color-scheme: dark)"
    />

    <title>Descubra o seu próximo rolle</title>
    <meta
        name="description"
        content="Explore lugares autênticos • curados por quem realmente vive a cidade. "
    />

    <!-- google metrics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-DCLWGMENPH"></script>
</svelte:head>

<div class="relative max-w-lg mx-auto bg-white border-l border-r min-h-dvh">
    {@render children()}

    <!-- Global modals -->
    <SigninModal />
</div>

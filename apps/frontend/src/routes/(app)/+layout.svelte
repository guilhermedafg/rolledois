<script lang="ts">
    import { onMount } from "svelte";
    import { rolleApi } from "@rolle/api";
    import { userStore } from "$lib/store";
    import { Nav } from "$lib/containers";
    import { CreateListModal, AddVenueToListModal } from "$lib/modals";

    import { dev, browser } from "$app/environment";
    import { page } from "$app/state";
    import { beforeNavigate, invalidateAll } from "$app/navigation";
    import { getCurrentPos, type LatLng } from "@rolle/geo";

    let { children, data } = $props();

    rolleApi.handleRefreshTokenExpired = async () => {
        await rolleApi.auth.signOut();
    };

    onMount(() => {
        if (dev) data.mixpanel.disable();
        data.mixpanel.track("first_view", { url: page.url });
        if (rolleApi.hasAuthToken) userStore.tryInit();
    });

    beforeNavigate(({ from, to }) => {
        data.mixpanel.track("navigation", { from: from?.url.pathname, to: to?.url.pathname });
    });

    if (!dev && browser) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(): void {
            window.dataLayer.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", "G-DCLWGMENPH");
    }

    $effect(() => {
        if (!dev && browser && typeof window.gtag !== "undefined") {
            data.mixpanel.track("page_view", { pathname: page.url.pathname });
            window.gtag("config", "G-DCLWGMENPH", {
                pathname: page.url.pathname,
            });
        }
    });

    $effect(() => {
        if (typeof $userStore === "undefined") return;
        data.mixpanel.identify($userStore.id.toString());
        data.mixpanel.people.set_once({
            email: $userStore.email,
            nickname: $userStore.nickname,
        });
    });

    $effect(() => {
        if (browser) {
            window.cookieStore.get("geoInfo").then((geoCookie) => {
                // no cookie??
                if (typeof geoCookie?.value === "undefined") return;

                // cookie parsing...
                const decoded = decodeURIComponent(geoCookie.value);
                const geoCookieParsed = JSON.parse(decoded) as LatLng;

                getCurrentPos(geoCookieParsed).then((currentPos) => {
                    // different location...
                    if (
                        currentPos.latitude !== geoCookieParsed.latitude &&
                        currentPos.longitude !== geoCookieParsed.longitude
                    ) {
                        window.cookieStore.set("geoInfo", JSON.stringify(currentPos)).then(() => {
                            return invalidateAll();
                        });
                    }
                });
            });
        }
    });
</script>

<div class="pb-4">
    <Nav />
    {@render children()}
</div>

{#if typeof $userStore !== "undefined"}
    <CreateListModal />
    <AddVenueToListModal mixpanel={data.mixpanel} />
{/if}

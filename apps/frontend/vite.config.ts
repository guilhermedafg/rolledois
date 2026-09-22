import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";
import path from "path";

export default defineConfig({
    plugins: [tailwindcss(), sveltePhosphorOptimize(), sveltekit()],
    server: {
        fs: {
            allow: [path.resolve(__dirname, "../../packages/*")],
        },
        allowedHosts: [".rolle.com.br"],
    },
    preview: {
        allowedHosts: [".rolle.com.br"],
    },
});

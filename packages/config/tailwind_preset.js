import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
    theme: {
        fontFamily: {
            sans: ["Helvetica Neue", "Helvetica", "Arial Narrow", "sans-serif"],
            highlight: ["Poppins", "sans-serif"],
        },
        fontSize: {
            xxs: ["0.625rem", { lineHeight: "120%" }], // 10px
            xs: ["0.75rem", { lineHeight: "120%" }], // 12px
            sm: ["0.875rem", { lineHeight: "120%" }], // 14px
            base: ["1rem", { lineHeight: "120%" }], // 16px
            lg: ["1.25rem", { lineHeight: "120%" }], // 20px
            xl: ["1.5rem", { lineHeight: "120%" }], // 24px
            xxl: ["2rem", { lineHeight: "120%" }], // 32px
            xxxl: ["2.5rem", { lineHeight: "120%" }], // 40px
            huge: ["3rem", { lineHeight: "120%" }], // 48px
        },
        lineHeight: {
            regular: "120%",
            medium: "130%",
            large: "150%",
        },
        colors: {
            transparent: "transparent",
            black: "#000000",
            white: "#FFFFFF",
            primary: {
                100: "#2A0C40",
                200: "#4E0185",
                300: "#6700B1",
                400: "#8108D7",
                500: "#A524FF",
                600: "#D094FF",
                700: "#E9D3FF",
                800: "#FBF8FF",
            },
            secondary: {
                100: "#020024",
                200: "#0F006E",
                300: "#1F00B7",
                400: "#2F0DFF",
                500: "#467AFF",
                600: "#6892FF",
                700: "#C5DCFF",
                800: "#F4F7FF",
            },
            tertiary: {
                200: "#0D293B",
                300: "#15B7CD",
                400: "#00F2FE",
                500: "#93F4F9",
            },
            grey: {
                100: "#343434",
                200: "#4A4A4A",
                300: "#6C6C6C",
                400: "#AFAFAF",
                500: "#D6D6D6",
                600: "#EDEDED",
                700: "#F8F8F8",
            },
            green: {
                200: "#14521F",
                300: "#216421",
                400: "#5CB85C",
                500: "#9CD99C",
            },
            yellow: {
                200: "#E4A111",
                300: "#EFB22E",
                400: "#F2C94E",
                500: "#F5DF9F",
            },
            red: {
                200: "#770800",
                300: "#880900",
                400: "#A80B00",
                500: "#F29C96",
            },
            blue: {
                200: "#005A88",
                300: "#00A5DC",
                400: "#00C2FF",
                500: "#C8E7FA",
            },
        },
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                ".drag-none": {
                    "-webkit-user-drag": "none",
                    "-khtml-user-drag": "none",
                    "-moz-user-drag": "none",
                    "-o-user-drag": "none",
                    "user-drag": "none",
                },
            });
        }),
    ],
};

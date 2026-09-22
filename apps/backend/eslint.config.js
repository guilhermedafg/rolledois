import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import custom_rules from "@rolle/config/eslint_rules.js";

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, prettier, {
    rules: {
        ...custom_rules,
    },
    parserOptions: {
        tsconfigRootDir: import.meta.dirname,
    },
});

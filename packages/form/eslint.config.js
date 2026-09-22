import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import custom_rules, { allow_any } from "@rolle/config/eslint_rules.js";

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
    rules: {
        ...custom_rules,
        ...allow_any,
    },
    parserOptions: {
        tsconfigRootDir: import.meta.dirname,
    },
});

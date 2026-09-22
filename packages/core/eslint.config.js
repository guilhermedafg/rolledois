import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import custom_rules from "@rolle/config/eslint_rules.js";

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
    rules: {
        ...custom_rules,
    },
    parserOptions: {
        tsconfigRootDir: import.meta.dirname,
    },
});

export const allow_any = {
    "no-explicit-any": 0,
    "@typescript-eslint/no-explicit-any": 0,
};

export default {
    "no-console": [1],
    "no-var": [2],
    "require-await": [2],
    "no-extra-semi": [2],
    "no-multi-spaces": [2],
    "no-useless-catch": [2],
    "no-nested-ternary": [2],
    "no-trailing-spaces": [2],
    "no-floating-decimal": [2],
    "no-unneeded-ternary": [2],
    "space-before-blocks": [2],
    semi: [2, "always"],
    radix: [2, "always"],
    quotes: [2, "double"],
    eqeqeq: [2, "always"],
    "eol-last": [2, "always"],
    "func-call-spacing": [2, "never"],
    "comma-dangle": [2, "always-multiline"],
    "no-multiple-empty-lines": [2, { max: 2, maxBOF: 2, maxEOF: 0 }],
    "comma-spacing": [2, { before: false, after: true }],
    "keyword-spacing": [2, { before: true, after: true }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
        "error",
        {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        },
    ],
    "@typescript-eslint/naming-convention": [
        2,
        {
            selector: ["default"],
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
            leadingUnderscore: "allow",
        },
        {
            selector: ["import"],
            format: ["camelCase", "snake_case", "PascalCase"],
        },
        {
            selector: ["objectLiteralProperty", "objectLiteralMethod"],
            format: ["camelCase", "snake_case"],
        },
        {
            selector: ["class", "interface", "enum", "typeAlias", "typeParameter"],
            format: ["PascalCase"],
        },
    ],
};

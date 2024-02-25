module.exports = {
    root: true,
    env: {
        "browser": true,
        "node": true,
        "es2021": true
    },
    parser: 'vue-eslint-parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended'
    ],
    plugins: ['@typescript-eslint', 'vue'],
    ignorePatterns: [".eslintrc.js"],
    parserOptions: {
        project: './tsconfig.json',
        "ecmaVersion": "latest",
        "sourceType": "module",
        parser: {
            js: '@typescript-eslint/parser',
            ts: '@typescript-eslint/parser',
            '<template>': 'espree',
        },
        extraFileExtensions: ['.vue'],
    },
    rules: {
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
            },
        ],
        "@typescript-eslint/array-type": [
            "error",
            {
                default: 'generic',
                readonly: 'generic',
            }
        ],
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                ignoredMethodNames: ['constructor']
            }
        ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                selector: ['typeLike'],
                format: ['PascalCase'],
            },
            {
                selector: ['method', 'classProperty', 'enumMember'],
                format: ['camelCase', 'PascalCase'],
            },
            {
                selector: ['variableLike'],
                format: ['camelCase', 'PascalCase'],
            }
        ],
        "@typescript-eslint/no-mixed-enums": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/typedef": [
            "error",
            {
                "propertyDeclaration": true,
                "parameter": true,
                "arrowParameter": true,
            }
        ],
        "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
        "no-empty-function": ["error", { "allow": ["arrowFunctions"] }],
        'vue/component-api-style': [
            'error',
            ['composition', 'script-setup'],
        ],
    },
    overrides: [
        {
            files: ['src/**/*.vue'],
            rules: {
                'vue/require-default-prop': 'off',
                'vue/no-v-html': 'off',
            },
        }
    ],
}

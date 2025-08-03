import prettier from 'eslint-config-prettier'
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: './tsconfig.json',
            },
            // Add these lines:
            globals: {
                console: 'readonly',
                process: 'readonly',
                module: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                Buffer: 'readonly',
                // add more Node.js globals if you use them
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            // Your custom rules here
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-undef': 'off',
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
    prettier,
]

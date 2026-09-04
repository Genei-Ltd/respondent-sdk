import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier/flat'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const jsFiles = ['**/*.{js,cjs,mjs}']
const tsFiles = ['**/*.{ts,cts,mts}']

export default defineConfig([
  {
    name: 'respondent-sdk/linter-options',
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  globalIgnores(['dist', 'src/generated']),
  {
    name: 'respondent-sdk/javascript',
    files: jsFiles,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    name: 'respondent-sdk/typescript',
    files: tsFiles,
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Prefer union literal types over enums.',
        },
      ],
      'no-undef': 'off',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    name: 'respondent-sdk/scripts',
    files: ['scripts/**/*.ts', 'examples/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ...prettierConfig,
    name: 'respondent-sdk/prettier',
  },
])

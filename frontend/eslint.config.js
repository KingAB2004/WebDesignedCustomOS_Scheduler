import js from '@eslint/js' // standard rulebook for base JavaScript.
import globals from 'globals'  // JavaScript acts differently depending on where it runs. If it runs in a browser, it knows what window and document are. If it runs on a server, it doesn't. This package contains dictionaries of those specific "global" words.

import reactHooks from 'eslint-plugin-react-hooks' // React rules.
import reactRefresh from 'eslint-plugin-react-refresh' // ensures "Fast Refresh" (when you save a file, the website updates instantly without losing your place) doesnt break
import { defineConfig, globalIgnores } from 'eslint/config' //

export default defineConfig([
  globalIgnores(['dist']), // ignores dist folder
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended, // Turns on all standard JS error checking.
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true }, // This tells ESLint, "Hey, I am going to put HTML directly inside my JavaScript. Don't panic, it's called JSX."
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])

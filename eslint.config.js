// ESLint flat config: recommended JavaScript rules plus the React hooks rules.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$', args: 'after-used', ignoreRestSiblings: true }],
    },
  },
  {
    files: ['tests/**', '*.config.js', 'scripts/**'],
    languageOptions: { globals: { ...globals.node } },
  },
];

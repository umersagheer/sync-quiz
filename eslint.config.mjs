import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import unusedImports from 'eslint-plugin-unused-imports'
import prettierConfig from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],

    // eslint-config-next already registers import, jsx-a11y, react, react-hooks
    // and @typescript-eslint. Re-registering any of them is a hard config error,
    // so everything below sets rules on plugins that are already loaded.
    plugins: { 'unused-imports': unusedImports },

    rules: {
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'after-used', ignoreRestSiblings: false, argsIgnorePattern: '^_.*?$' },
      ],

      // Type imports first, then a blank line, then value imports by distance.
      // This is why files here open with an `import type { … }` block.
      'import/order': [
        'warn',
        {
          groups: [
            'type',
            'builtin',
            'object',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],

      // eslint-config-next enables only the ARIA-correctness subset of jsx-a11y.
      // These are the interaction and semantics rules, and they are the ones that
      // matter for a quiz built almost entirely out of radio and checkbox groups:
      // they are what stops an option card becoming a <div> with an onClick.
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },

  // Prettier owns formatting; this switches off the rules that would fight it.
  // Kept last so it wins.
  prettierConfig,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig

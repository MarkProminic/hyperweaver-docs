import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// Same strict ruleset as hyperweaver-server / zoneweaver-agent. This is a Jekyll
// docs site, so the only JavaScript is the Node build helper in scripts/ — but it
// is held to the exact same standard as the app repos. Everything Jekyll (generated
// site, vendored theme/lunr JS, Ruby bundle, sass, build-fetched changelogs) is
// ignored.
export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**/*', // Dependencies
      '_site/**/*', // Jekyll build output (generated site + vendored theme/lunr JS)
      'vendor/**/*', // Jekyll Ruby gem bundle
      '.jekyll-cache/**/*', // Jekyll build cache
      '_sass/**/*', // Jekyll sass files
      'changelogs/**/*', // Build-fetched component changelogs
      '**/*.min.js', // Minified/vendored files anywhere
      '**/*.log', // Log files
    ],
  },

  // JavaScript files configuration - Comprehensive Node.js Rules
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024, // Latest ECMAScript version
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Base JavaScript rules (recommended + enhanced)
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // === VARIABLES & DECLARATIONS ===
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'all',
          caughtErrors: 'all',
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: false,
        },
      ],
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-shadow': 'error',
      'no-shadow-restricted-names': 'error',
      'no-redeclare': 'error',

      // === FUNCTIONS ===
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-loop-func': 'error',
      'no-new-func': 'error',
      'default-param-last': 'error',
      'no-param-reassign': ['error', { props: false }],

      // === OBJECTS & ARRAYS ===
      'object-shorthand': ['error', 'always'],
      'prefer-destructuring': ['error', { array: true, object: true }],
      'no-array-constructor': 'error',
      'array-callback-return': ['error', { allowImplicit: true }],
      'prefer-spread': 'error',
      'prefer-rest-params': 'error',

      // === STRINGS & TEMPLATES ===
      'prefer-template': 'error',
      'no-useless-escape': 'error',
      'no-useless-concat': 'error',

      // === COMPARISON & CONDITIONALS ===
      eqeqeq: ['error', 'always'],
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'error',
      'no-else-return': 'error',
      'consistent-return': 'error',

      // === ERROR HANDLING ===
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'error',

      // === ASYNC/AWAIT & PROMISES ===
      'require-await': 'error',
      'no-await-in-loop': 'warn',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',

      // === MODULES ===
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',

      // === SECURITY & BEST PRACTICES ===
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-caller': 'error',
      'no-iterator': 'error',
      'no-proto': 'error',
      'no-extend-native': 'error',
      'no-global-assign': 'error',

      // === NODE.JS SPECIFIC ===
      'no-process-exit': 'off', // Allow process.exit in the build script
      'no-process-env': 'off', // Allow process.env for spec-URL overrides
      'no-console': 'off', // Allow console in the build script

      // === CODE QUALITY ===
      complexity: ['warn', 30],
      'max-depth': ['warn', 6],
      'max-params': ['warn', 8],

      // === NAMING CONVENTIONS ===
      camelcase: 'off', // Allow snake_case (user preference for system/API code)
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],

      // === PERFORMANCE ===
      'no-lonely-if': 'error',
      'no-useless-call': 'error',
      'no-useless-return': 'error',
      'no-useless-constructor': 'error',

      // === MODERN JAVASCRIPT ===
      'prefer-object-spread': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',

      // === DOCUMENTATION ===
      'valid-jsdoc': 'off',
      'require-jsdoc': 'off',

      // === STYLE (handled by Prettier, but keep logical ones) ===
      curly: ['error', 'all'],
      'dot-notation': 'error',
      'no-multi-assign': 'error',
      'one-var': ['error', 'never'],

      // === REGEX ===
      'prefer-named-capture-group': 'warn',
      'prefer-regex-literals': 'error',
      'no-useless-backreference': 'error',

      // === IMPORT/EXPORT ===
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../**/node_modules/**'],
        },
      ],

      // === DEBUGGING ===
      'no-debugger': 'warn',
      'no-alert': 'error',

      // === UNICODE & SPECIAL CHARACTERS ===
      'unicode-bom': ['error', 'never'],
      'no-irregular-whitespace': 'error',
    },
  },

  // Configuration files
  {
    files: ['**/config/**/*.js', '**/*.config.js', '**/*.config.mjs'],
    rules: {
      'no-process-env': 'off',
      'no-magic-numbers': 'off',
    },
  },
];

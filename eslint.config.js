const eslint = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const jestPlugin = require("eslint-plugin-jest");
const globals = require("globals");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      jest: jestPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    files: ["__tests__/**/*.ts", "**/*.test.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      jest: jestPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...jestPlugin.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    ...eslint.configs.recommended,
  },
];

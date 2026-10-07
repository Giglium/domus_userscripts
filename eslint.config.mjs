import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  { rules: { "no-unused-vars": ["error", { caughtErrors: "none" }] } },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: { ...globals.browser, GM_xmlhttpRequest: "readonly" },
    },
  },
  {
    files: ["tests/**/*.js", "webpack.config.js", "playwright.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["tests/browser/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["src/lib/core/bootstrap.js"],
    rules: { "no-unused-vars": "off" },
  },
];

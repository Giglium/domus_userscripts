const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.spec.js",
  forbidOnly: !!process.env.CI,
  use: { browserName: "chromium", trace: "on-first-retry" },
  reporter: process.env.CI ? "github" : "list",
});

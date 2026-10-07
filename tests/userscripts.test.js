import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dir, "..");
const scripts = readdirSync(path.join(root, "src"), { withFileTypes: true })
  .filter(
    (item) =>
      item.isDirectory() &&
      existsSync(path.join(root, "src", item.name, "index.js")),
  )
  .map((item) => item.name);
const require = createRequire(import.meta.url);

describe("Domus userscripts", () => {
  test("Webpack discovers the three sites", () => {
    const config = require(path.join(root, "webpack.config.js"));
    expect(Object.keys(config.entry).sort()).toEqual([
      "animeworld",
      "examheist",
      "mslearn",
    ]);
    expect(scripts.sort()).toEqual(Object.keys(config.entry).sort());
  });

  test("Webpack extracts Sass and emits CSS Module selectors", () => {
    const config = require(path.join(root, "webpack.config.js"));
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const sassRule = config.module.rules.find((rule) =>
      rule.test?.test("style.scss"),
    );
    expect(
      config.plugins.some((plugin) => plugin instanceof MiniCssExtractPlugin),
    ).toBe(true);
    expect(sassRule.use).toEqual([
      MiniCssExtractPlugin.loader,
      "css-loader",
      "sass-loader",
    ]);

    const examHeist = readFileSync(
      path.join(root, "dist", "examheist.user.js"),
      "utf8",
    );
    expect(examHeist).toMatch(
      /\.domus-ui \.button\.[\w-]+\{position:fixed;top:16px;right:16px;z-index:99999\}/,
    );
    expect(examHeist).toContain(".domus-ui .button");
    expect(examHeist).toMatch(/\.domus-ui \.modal\{/);
  });

  test("every userscript includes its metadata and bundled CSS", () => {
    for (const script of scripts) {
      const meta = JSON.parse(
        readFileSync(path.join(root, "src", script, "meta.json"), "utf8"),
      );
      const packageVersion = JSON.parse(
        readFileSync(path.join(root, "package.json"), "utf8"),
      ).version;
      const userScript = readFileSync(
        path.join(root, "dist", `${script}.user.js`),
        "utf8",
      );
      const metaScript = readFileSync(
        path.join(root, "dist", `${script}.meta.js`),
        "utf8",
      );
      expect(userScript.startsWith("// ==UserScript==")).toBe(true);
      expect(userScript.match(/^\/\/ @version\s+(\S+)/m)?.[1]).toBe(
        meta.version,
      );
      expect(meta.version).toBe(packageVersion);
      if (script === "animeworld") {
        expect(meta.grant).toContain("GM_xmlhttpRequest");
        expect(meta.grant).not.toContain("GM_download");
      }
      expect(metaScript.startsWith("// ==UserScript==")).toBe(true);
      expect(metaScript).toContain("// @grant        GM_addStyle");
      expect(meta.updateURL).toEndWith(`/${script}.meta.js`);
      expect(meta.downloadURL).toEndWith(`/${script}.user.js`);
    }
    expect(
      readdirSync(path.join(root, "dist")).some((file) =>
        file.endsWith(".css"),
      ),
    ).toBe(false);
  });
});

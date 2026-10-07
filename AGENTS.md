# AGENTS.md

## Project Overview

This is a userscript monorepo (`domus-userscripts`) that builds browser userscripts for personal use. Scripts are bundled with Webpack via `webpack-monkey` and installed via Violent Monkey.

## Tech Stack

- **Language:** JavaScript (ES modules in source, CommonJS for build config)
- **Bundler:** Webpack 5 with `webpack-monkey` for userscript metadata injection
- **CSS:** Existing global SCSS is compiled via `sass-loader` and `mini-css-extract-plugin`, then inlined into each userscript
- **CSS Framework:** Bulma
- **Linting:** ESLint (flat config, `@eslint/js` recommended rules, browser globals)
- **Formatting:** Prettier
- **Build orchestration:** GNU Make with Bun and a committed `bun.lock`

## Project Structure

```
src/
├── <script-name>/       # One folder per userscript
│   ├── index.js         # Entry point (discovered by webpack.config.js)
│   └── meta.json        # Userscript metadata (name, match, grant, etc.)
├── lib/
│   ├── core/            # Shared bootstrap, error handling, logger
│   ├── css/             # Shared SCSS styles
│   └── dom/             # Shared DOM utilities
dist/                    # Build output (gitignored)
tests/                   # Build-output tests and ExamHeist browser smoke test
```

## Commands

| Task                    | Command                |
| ----------------------- | ---------------------- |
| Install dependencies    | `make init`            |
| Refresh script metadata | `make update-metadata` |
| Build all userscripts   | `make build`           |
| Start dev server        | `make serve`           |
| Format sources          | `make fmt`             |
| Run linter              | `make lint`            |
| Run build/unit tests    | `make test`            |
| Run browser test        | `make test.browser`    |
| Upload to Altervista    | `make upload`          |

## Coding Conventions

- Use ES module `import`/`export` syntax in source files under `src/`.
- Use JSDoc comments for documenting functions.
- Each userscript must have an `index.js` entry point and a `meta.json` file.
- Wrap script logic with `bootstrap()` from `src/lib/core/bootstrap.js`; its error handling is currently disabled, so do not rely on it to catch failures.
- `src/lib/css/style.scss` contains only shared theme tokens and root defaults. Feature styles live beside their owning component; use plain scoped `.scss` for Bulma selectors and `.module.scss` for local class names so CSS Modules do not rename Bulma classes. CSS Modules do not isolate the site's own styles or userscript selectors that intentionally affect site content.
- Keep `@match` patterns narrow and request only the grants a script uses. Scope userscript UI to `.domus-ui`; leave site-target selectors such as ExamHeist answer classes explicit.
- Route reusable project operations and the Git hook through Make targets. CI-only one-line shell commands stay in their workflows.
- Shared utilities go in `src/lib/`; script-specific code stays in its own folder.
- Do not import Node.js modules in source files — these run in the browser.
- `webpack.config.js` is CommonJS (`require`) since Webpack loads it directly.

## Adding a New Userscript

1. Create `src/<name>/index.js` and `src/<name>/meta.json`.
2. Webpack and Make discover the new entry automatically; no list needs updating.
3. Import `bootstrap` from `../lib/core/bootstrap.js` and wrap the main logic.
4. `make build` syncs the shared version and Altervista URLs into script metadata; commit those updates before release. Run `make update-metadata` to refresh metadata without building.

## Linting & Formatting

- ESLint uses the local flat config in `eslint.config.mjs`.
- Browser globals are enabled; Node.js globals are not available in source.
- Build configuration is linted; `dist/` is ignored.
- Prettier is the canonical formatter (run via `make fmt`).

## Build Notes

- `make update-metadata` updates the script versions and URLs from `package.json` and `UPDATE_URL`; `make build` runs it before compiling.
- The existing `UPDATE_URL` and `make upload` settings publish to Altervista. Release assets are also attached by GitHub Actions; Pages is opt-in.
- Output goes to `dist/` which is gitignored; only commit source files.

# AGENTS.md

## Project Overview

This is a userscript monorepo (`domus-userscripts`) that builds browser userscripts for personal use. Scripts are bundled with Webpack via `webpack-monkey` and installed via Violent Monkey.

## Tech Stack

- **Language:** JavaScript (ES modules in source, CommonJS for build config)
- **Bundler:** Webpack 5 with `webpack-monkey` for userscript metadata injection
- **CSS:** SCSS compiled via `sass-loader`, extracted with `mini-css-extract-plugin`
- **CSS Framework:** Bulma
- **Linting:** ESLint (flat config, `@eslint/js` recommended rules, browser globals)
- **Formatting:** Prettier
- **Build orchestration:** GNU Make (targets delegate to `build-tools` submodule)

## Project Structure

```
src/
├── <script-name>/       # One folder per userscript
│   ├── index.js         # Entry point (registered in webpack.config.js)
│   └── meta.json        # Userscript metadata (name, match, grant, etc.)
├── lib/
│   ├── core/            # Shared bootstrap, error handling, logger
│   ├── css/             # Shared SCSS styles
│   └── dom/             # Shared DOM utilities
dist/                    # Build output (gitignored)
build-tools/             # Git submodule with reusable Make includes
```

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `make init` |
| Build all userscripts | `make build` |
| Start dev server | `make dev` |
| Format sources | `make fmt` |
| Run linter | `make lint` |
| Clean caches | `make clean` |
| Update build-tools submodule | `make update` |

## Coding Conventions

- Use ES module `import`/`export` syntax in source files under `src/`.
- Use JSDoc comments for documenting functions.
- Each userscript must have an `index.js` entry point and a `meta.json` file.
- Wrap script logic with `bootstrap()` from `src/lib/core/bootstrap.js` to get consistent error handling and initialization.
- Shared utilities go in `src/lib/`; script-specific code stays in its own folder.
- Do not import Node.js modules in source files — these run in the browser.
- `webpack.config.js` is CommonJS (`require`) since Webpack loads it directly.

## Adding a New Userscript

1. Create `src/<name>/index.js` and `src/<name>/meta.json`.
2. Add the entry to `webpack.config.js` under `entry`.
3. Add the script name to the `SCRIPTS` list in the root `Makefile`.
4. Import `bootstrap` from `../lib/core/bootstrap.js` and wrap the main logic.

## Linting & Formatting

- ESLint uses the flat config at `build-tools/javascript/config/userscript.eslint.config.mjs`.
- Browser globals are enabled; Node.js globals are not available in source.
- `webpack.config.js` and `dist/` are excluded from linting.
- Prettier is the canonical formatter (run via `make fmt`).

## Build Notes

- The build injects `version` from `package.json` into each `meta.json`.
- `updateURL` and `downloadURL` in `meta.json` are auto-populated from the repository URL during build.
- Output goes to `dist/` which is gitignored; only commit source files.

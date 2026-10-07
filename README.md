# Domus Userscripts

This repository houses a collection of userscripts for personal use.

## Supported Sites

- [AnimeWorld](https://www.animeworld.ac/) — Download MP4 videos from play pages
- ExamHeist — Hide and reveal answers
- Microsoft Learn — Download quiz notes

## Installation

To get started, follow these simple steps:

- **Install the Script Manager**: Begin by installing the [Violent Monkey](https://violentmonkey.github.io/) script manager extension. You can download it [here](https://violentmonkey.github.io/get-it/).
- **Clone the Repository**: Clone this repository to your local machine using Git:

```bash
git clone git@github.com:Giglium/domus-userscripts.git
cd domus-userscripts
```

- **Install Dependencies**: Navigate to the cloned repository directory and install the necessary dependencies:

```bash
make init
```

- **Build the Scripts**: Once the dependencies are installed, build the scripts using Make and Bun:

```bash
make build
```

- **Install Scripts on Violent Monkey**: With the scripts built, locate the `dist` folder within the repository directory. You'll find the compiled scripts here. Follow the instructions provided by [Violent Monkey](https://violentmonkey.github.io/) on [how to install userscripts](https://violentmonkey.github.io/guide/creating-a-userscript/).

## Development

The project requires Bun 1.4.2 (see `.bun-version`), GNU Make, and jq. Run `make lint`, `make test`, and `make test.browser` before merging. The browser test needs Chromium (`bunx playwright install chromium` locally). `make serve` starts the development server. `make init` sets up the pre-commit hook to format and re-stage already-staged files via `make fmt STAGED=1`.

Add a userscript by creating `src/<name>/index.js` and `src/<name>/meta.json`; the build discovers entries automatically. Bulma styles are scoped under the shared `.domus-ui` root, and local UI selectors use CSS Modules (`.module.scss`). This prevents the userscript's component styles from changing host-page elements; site-specific selectors that intentionally affect page content remain global.

## Publishing

The shared version is in `package.json`. `make build` refreshes script versions and URLs from `package.json` and the Makefile before compiling; commit the updated metadata. Run `make update-metadata` to refresh metadata without building. To continue publishing to the current Altervista host, run `make upload` (or override `UPLOADER` and `UPLOAD_ARGS`). The existing HTTP update URLs are unchanged.

Publish a manual GitHub Release for a tag of the form `v<version>` to attach all `.user.js` and `.meta.js` files as historical release assets. The release workflow builds but does not rerun lint or tests; tag a commit that passed the separate Lint, Test, and Browser Test checks. Set repository variable `PUBLISH_PAGES=true` and enable Pages via GitHub Actions only if you also want Pages hosting; by default the custom Altervista host stays authoritative. Releases do not upload to Altervista automatically.

Dependabot PRs can auto-merge only when the three checks are required in branch protection and GitHub Actions may create and approve PRs. To receive reviewable template-sync PRs, configure a `TEMPLATE_SYNC_TOKEN` secret that can read `Giglium/userscripts-template` and write Contents, Pull requests, and Workflows in this repo. Template sync excludes repository-specific scripts, versions, and Make settings; review workflow updates for any Make targets needed locally.

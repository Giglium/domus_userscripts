SHELL := /bin/sh
.DEFAULT_GOAL := help

VERSION := $(shell jq -r '.version' package.json)
REPOSITORY := $(shell jq -r '.repository.url | sub("\\.git$$"; "")' package.json)
OWNER := $(shell printf '%s' '$(REPOSITORY)' | cut -d/ -f4)
REPO := $(shell printf '%s' '$(REPOSITORY)' | cut -d/ -f5)
UPDATE_URL ?= http://menudock.altervista.org/domus
UPLOADER ?= altervista-push
UPLOAD_ARGS ?= domus
SCRIPTS := $(notdir $(patsubst %/,%,$(dir $(wildcard src/*/index.js))))

.PHONY: help init update-metadata build serve fmt lint test test.browser clean upload all
help: ## Show available targets
	@sed -n 's/^\([a-zA-Z.]*\):.*## /\1 - /p' Makefile

init: ## Install dependencies and configure the formatting hook
	$(if $(CI),bun ci,bun install) --ignore-scripts
	CI=1 bun install --cwd node_modules/webpack-monkey
	bun run --cwd node_modules/webpack-monkey build
	@chmod +x .githooks/pre-commit
	@if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then \
		current=$$(git config --local --get core.hooksPath || :); \
		if [ -n "$$current" ] && [ "$$current" != .githooks ]; then \
			echo "Existing core.hooksPath: $$current; install .githooks/pre-commit manually" >&2; \
		else \
			git config --local core.hooksPath .githooks; \
		fi; \
	fi

update-metadata: ## Refresh script versions and URLs from project settings
	@for script in $(SCRIPTS); do \
		file="src/$$script/meta.json"; \
		jq --arg version '$(VERSION)' \
		   --arg update_url '$(UPDATE_URL)/'"$$script"'.meta.js' \
		   --arg download_url '$(UPDATE_URL)/'"$$script"'.user.js' \
		   '.version = $$version | .updateURL = $$update_url | .downloadURL = $$download_url' \
		   "$$file" > "$$file.tmp" && mv "$$file.tmp" "$$file" || exit 1; \
	done
	@bunx prettier --write $(addprefix src/,$(addsuffix /meta.json,$(SCRIPTS)))

build: update-metadata ## Sync metadata and compile all userscripts
	bun run build

serve: ## Start Webpack development server
	bun run serve

fmt: ## Format sources
	$(if $(STAGED),@git diff --cached --name-only -z --diff-filter=ACMR | xargs -0 bunx prettier --write --ignore-unknown --,bun run fmt)

lint: ## Run local static analysis and formatting checks
	bun run lint

test: build ## Build and run unit tests
	bun run test

test.browser: build ## Build and run browser smoke tests
	bun run test:browser

clean: ## Remove generated build files
	@rm -rf dist

upload: build ## Upload dist/* to the configured host
	@if [ -z "$(strip $(UPLOADER))" ]; then echo 'Set UPLOADER to your upload command' >&2; exit 1; fi
	@for file in dist/*; do $(UPLOADER) "$$file" $(UPLOAD_ARGS) || exit 1; done

all: build upload
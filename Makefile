TECHNOLOGY := javascript
VERSION := $(shell jq -r '.version' package.json)
SUPER_LINTER_FMT := -e FIX_MARKDOWN=true -e FIX_JSON=true -e FIX_YAML_PRETTIER=true -e FIX_CSS=true -e FIX_CSS_PRETTIER=true -e FIX_JAVASCRIPT_ES=true -e FIX_JAVASCRIPT_PRETTIER=true -e FIX_JAVASCRIPT_STANDARD=true -e FIX_JSON_PRETTIER=true

# =============================================================================
# Publication / Upload settings
# =============================================================================
SCRIPTS := animeworld mslearn

include ./build-tools/common.mk
include $(BUILD_TOOLS_FOLDER)/common_linters.mk
include $(BUILD_TOOLS_FOLDER)/$(TECHNOLOGY)/$(TECHNOLOGY).mk
include $(BUILD_TOOLS_FOLDER)/$(TECHNOLOGY)/userscript.mk
include $(BUILD_TOOLS_FOLDER)/git.mk

# Detect the OS
ifeq ($(OS),macos)
export DOCKER_DEFAULT_PLATFORM := linux/amd64
endif

# =============================================================================
# Top-level targets
# =============================================================================

.PHONY: all
all: build ## Build every userscript

.PHONY: fmt
fmt: javascript.fmt ## Format JS/CSS/JSON sources

.PHONY: lint
lint: lint.superlinter ## Run static analysis

.PHONY: init
init: javascript.init userscript.init ## Install dev dependencies

.PHONY: build
build: userscript.build ## Compile userscripts into dist/

.PHONY: dev
dev: userscript.dev ## Run the development server

.PHONY: clean
clean: lint.clean ## Clean linter caches

.PHONY: update
update: git.submodules ## Refresh the build-tools submodule

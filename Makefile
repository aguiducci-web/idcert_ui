# === idcert-ui monorepo ===
# Makefile for dev + Verdaccio ops + publishing

REGISTRY ?= http://localhost:4873/
VERDACCIO_DIR ?= $(HOME)/verdaccio
DOCKER_COMPOSE = docker compose

.PHONY: help install build test lint typecheck dev \
	verdaccio-config verdaccio-start verdaccio-stop verdaccio-logs verdaccio-clean \
	publish release clean

help:
	@echo "=== Development ==="
	@echo "  make install       - pnpm install"
	@echo "  make build         - build all packages"
	@echo "  make test          - run tests"
	@echo "  make lint          - lint code"
	@echo "  make typecheck     - typecheck"
	@echo "  make dev           - start Storybook + playground"
	@echo ""
	@echo "=== Verdaccio (requires Docker) ==="
	@echo "  make verdaccio-config   - create /opt/verdaccio config"
	@echo "  make verdaccio-start    - start Verdaccio + Caddy"
	@echo "  make verdaccio-stop     - stop Verdaccio"
	@echo "  make verdaccio-logs     - tail Verdaccio logs"
	@echo "  make verdaccio-clean    - remove Verdaccio data"
	@echo ""
	@echo "=== Publishing ==="
	@echo "  make publish       - build + publish to Verdaccio"
	@echo "  make release       - version + build + publish + git tag"
	@echo ""
	@echo "Options:"
	@echo "  REGISTRY=<url>           - registry URL (default: $(REGISTRY))"
	@echo "  VERDACCIO_DIR=<path>     - Verdaccio root (default: $(VERDACCIO_DIR))"

# === Development targets ===

install:
	pnpm install

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

dev:
	pnpm dev

clean:
	pnpm clean
	rm -rf node_modules

# === Verdaccio targets ===

verdaccio-config:
	@mkdir -p $(VERDACCIO_DIR)/{storage,conf,plugins}
	@test -f $(VERDACCIO_DIR)/docker-compose.yml || \
		(echo "✓ Creating docker-compose.yml" && \
		 sed "s|/opt/verdaccio|$(VERDACCIO_DIR)|g" docs/infra/docker-compose.yml > $(VERDACCIO_DIR)/docker-compose.yml)
	@test -f $(VERDACCIO_DIR)/Caddyfile || \
		(echo "✓ Creating Caddyfile" && \
		 cp docs/infra/Caddyfile $(VERDACCIO_DIR)/)
	@test -f $(VERDACCIO_DIR)/conf/config.yaml || \
		(echo "✓ Creating config.yaml" && \
		 mkdir -p $(VERDACCIO_DIR)/conf && \
		 cp docs/infra/config.yaml $(VERDACCIO_DIR)/conf/)
	@sudo chown -R 10001:65533 $(VERDACCIO_DIR)/storage $(VERDACCIO_DIR)/plugins $(VERDACCIO_DIR)/conf 2>/dev/null || true
	@echo "✓ Verdaccio config ready at $(VERDACCIO_DIR)"

verdaccio-start: verdaccio-config
	cd $(VERDACCIO_DIR) && $(DOCKER_COMPOSE) up -d
	@echo "✓ Verdaccio started on $(REGISTRY)"
	@echo "→ Web UI: http://localhost:4873/ (if local)"
	@sleep 2 && curl -s -I http://localhost:4873/ | head -1 || echo "⚠ Registry check failed"

verdaccio-stop:
	cd $(VERDACCIO_DIR) && $(DOCKER_COMPOSE) down
	@echo "✓ Verdaccio stopped"

verdaccio-logs:
	cd $(VERDACCIO_DIR) && $(DOCKER_COMPOSE) logs --tail=100 -f verdaccio

verdaccio-clean:
	@echo "⚠ This will delete all published packages in Verdaccio"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd $(VERDACCIO_DIR) && $(DOCKER_COMPOSE) down; \
		rm -rf $(VERDACCIO_DIR)/storage/*; \
		echo "✓ Verdaccio cleaned"; \
	fi

# === Publishing targets ===

publish: build
	@echo "Publishing to $(REGISTRY)"
	pnpm --filter @idcert/ui publish --registry $(REGISTRY)
	pnpm --filter @idcert/tokens publish --registry $(REGISTRY)
	pnpm --filter @idcert/tailwind-config publish --registry $(REGISTRY)
	@echo "✓ Packages published"

release:
	@echo "Release workflow: version → build → publish → tag"
	pnpm changeset version
	pnpm build
	pnpm changeset publish
	git push --follow-tags
	@echo "✓ Release complete"
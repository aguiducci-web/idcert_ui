# === idcert-ui monorepo ===
# Makefile for dev + Verdaccio ops + publishing

REGISTRY ?= http://localhost:4873/
VERDACCIO_DIR ?= $(HOME)/verdaccio
DOCKER_COMPOSE = docker compose

# Load .env if present (VERDACCIO_USER, VERDACCIO_PASS, VERDACCIO_EMAIL)
-include .env
export

.PHONY: help install build test lint typecheck dev \
	verdaccio-config verdaccio-start verdaccio-stop verdaccio-logs verdaccio-clean verdaccio-login \
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
	@echo "  make verdaccio-login    - register/login user via REST, write token to ~/.npmrc"
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

verdaccio-login:
	@test -n "$(VERDACCIO_USER)" || (echo "✗ VERDACCIO_USER not set (define in .env)"; exit 1)
	@test -n "$(VERDACCIO_PASS)" || (echo "✗ VERDACCIO_PASS not set (define in .env)"; exit 1)
	@test -n "$(VERDACCIO_EMAIL)" || (echo "✗ VERDACCIO_EMAIL not set (define in .env)"; exit 1)
	@echo "→ Login '$(VERDACCIO_USER)' on $(REGISTRY)"
	@RESP=$$(curl -s -w "\n__HTTP__%{http_code}" -X PUT \
		-u "$(VERDACCIO_USER):$(VERDACCIO_PASS)" \
		-H "Content-Type: application/json" \
		-d '{"name":"$(VERDACCIO_USER)","password":"$(VERDACCIO_PASS)","email":"$(VERDACCIO_EMAIL)"}' \
		$(REGISTRY)-/user/org.couchdb.user:$(VERDACCIO_USER)); \
	BODY=$$(echo "$$RESP" | sed '$$d'); \
	CODE=$$(echo "$$RESP" | tail -n1 | sed 's/__HTTP__//'); \
	TOKEN=$$(echo "$$BODY" | sed -n 's/.*"token":[[:space:]]*"\([^"]*\)".*/\1/p'); \
	if [ -z "$$TOKEN" ]; then \
		echo "✗ Login failed (HTTP $$CODE)"; \
		echo "  Response: $$BODY"; \
		echo "  Hint: user may exist with different password. Delete htpasswd line:"; \
		echo "    docker exec verdaccio sed -i '/^$(VERDACCIO_USER):/d' /verdaccio/storage/htpasswd"; \
		exit 1; \
	fi; \
	REG_HOST=$$(echo "$(REGISTRY)" | sed 's|^http[s]*:||'); \
	touch $$HOME/.npmrc; \
	cp $$HOME/.npmrc $$HOME/.npmrc.bak.$$(date +%s); \
	grep -vE "^(https?:)?$${REG_HOST}:_authToken=" $$HOME/.npmrc > $$HOME/.npmrc.tmp || true; \
	grep -v "^@idcert:registry=" $$HOME/.npmrc.tmp > $$HOME/.npmrc.tmp2 || true; \
	mv $$HOME/.npmrc.tmp2 $$HOME/.npmrc; \
	rm -f $$HOME/.npmrc.tmp; \
	echo "$${REG_HOST}:_authToken=$$TOKEN" >> $$HOME/.npmrc; \
	echo "@idcert:registry=$(REGISTRY)" >> $$HOME/.npmrc; \
	echo "✓ Token written to ~/.npmrc (HTTP $$CODE)"

verdaccio-clean:
	@echo "⚠ DESTRUCTIVE: removes ALL packages, htpasswd users, npm proxy cache (docker named volumes)"
	@printf "Type 'YES' to confirm: "; \
	read CONFIRM; \
	if [ "$$CONFIRM" != "YES" ]; then echo "✗ Aborted"; exit 1; fi
	cd $(VERDACCIO_DIR) && $(DOCKER_COMPOSE) down -v
	@echo "✓ Containers + volumes removed"
	@echo "→ Next: make verdaccio-start && make verdaccio-login"

# === Publishing targets ===

publish: build
	@echo "Publishing to $(REGISTRY)"
	cd packages/tokens && pnpm publish --registry $(REGISTRY) --no-git-checks
	cd packages/tailwind-config && pnpm publish --registry $(REGISTRY) --no-git-checks
	cd packages/ui && pnpm publish --registry $(REGISTRY) --no-git-checks
	@echo "✓ Packages published"

release:
	@echo "Release workflow: version → build → publish → tag"
	pnpm changeset version
	pnpm build
	pnpm changeset publish
	git push --follow-tags
	@echo "✓ Release complete"
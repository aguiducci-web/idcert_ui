# Verdaccio + Bitbucket setup guide

Guida completa per pubblicare i pacchetti `@idcert/*` su un registry Verdaccio
self-hosted, integrato con repo Bitbucket e CI Bitbucket Pipelines.

---

## Stato progetto attuale

Monorepo già pronto per pubblicazione:

- **Turborepo + pnpm workspace + Changesets** — pipeline `release` configurato
  (`turbo run build --filter=./packages/* && changeset publish`)
- 3 pacchetti pubblicabili:
  - `@idcert/ui` 1.0.0
  - `@idcert/tokens` 0.1.0
  - `@idcert/tailwind-config` 0.2.0
- `tsup` build → `dist/` ESM+CJS+types, `exports` map corretto, `files: ["dist"]`
- `repository.url` punta a `github.com/idcert/ui` → da cambiare per Bitbucket
- `.npmrc` minimale, manca config registry privato
- Verdaccio locale già in uso

---

## Perché Verdaccio (e non Bitbucket nativo)

**Bitbucket Cloud non ha registry npm nativo.** Quindi serve registry esterno.

| Opzione | Pro | Contro |
|---|---|---|
| **Verdaccio self-hosted** (scelto) | Controllo totale, gratis (solo VM ~5€/mese), già conosciuto | Manutenzione tua |
| JFrog Artifactory Cloud | Multi-formato, integrazione Bitbucket | ~$98/mese tier base |
| Cloudsmith | Setup rapido, free tier 1GB | Vendor lock |
| GitHub Packages | Gratis su repo private | Richiede repo mirror GitHub |
| Tarball git+ssh | Niente registry | No semver, no caching, brutto per consumer |

---

## Architettura target

```
┌──────────────────┐         ┌─────────────────────────┐
│ Bitbucket Repo   │  push   │ Bitbucket Pipelines     │
│ idcert-ui        ├────────▶│ build/test/publish      │
└──────────────────┘         └────────────┬────────────┘
                                          │ npm publish
                                          ▼
                              ┌──────────────────────────┐
                              │ VPS (Hetzner)            │
                              │ ┌──────────────────────┐ │
                              │ │ Caddy (TLS auto)     │ │
                              │ │   ↓ reverse proxy    │ │
                              │ │ Verdaccio (Docker)   │ │
                              │ └──────────────────────┘ │
                              │ npm.idcert.io            │
                              └──────────────────────────┘
                                          ▲
                                          │ pnpm install
                              ┌───────────┴───────────────┐
                              │ Apps consumer @idcert/*   │
                              └───────────────────────────┘
```

---

## 1. Provisioning VPS

### Hetzner (raccomandato)

1. Account → Cloud Console → New Project "idcert-infra"
2. Add Server:
   - Location: Nuremberg (latenza EU)
   - Image: **Ubuntu 24.04**
   - Type: **CX22** (€4.51/mese, 2 vCPU, 4GB RAM)
   - SSH key: incolla pubblica (`~/.ssh/id_ed25519.pub`)
   - Name: `verdaccio-prod`
3. Create → IP pubblico assegnato

### DNS

Provider DNS idcert.io:

- Record A: `npm.idcert.io` → IP VPS
- TTL: 300

Aspetta propagazione:

```bash
dig npm.idcert.io +short
```

---

## 2. Hardening base

```bash
ssh root@<IP>

# update
apt update && apt upgrade -y
apt install -y ufw fail2ban unattended-upgrades

# user non-root
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# disabilita root SSH + password auth
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# auto security updates
dpkg-reconfigure -plow unattended-upgrades
```

> **Warning:** verifica login SSH come `deploy` in **secondo terminale** PRIMA
> di chiudere sessione root, altrimenti rischio lockout.

```bash
# test in nuovo terminale
ssh deploy@<IP>
```

OK → procedi.

---

## 3. Install Docker

```bash
ssh deploy@<IP>

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy
newgrp docker

docker version
docker compose version
```

---

## 4. Layout filesystem

```bash
sudo mkdir -p /opt/verdaccio/{storage,conf,plugins}
sudo chown -R deploy:deploy /opt/verdaccio
cd /opt/verdaccio
```

---

## 5. File config

### `/opt/verdaccio/docker-compose.yml`

```yaml
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    restart: unless-stopped
    expose: ["4873"]
    volumes:
      - ./storage:/verdaccio/storage
      - ./conf:/verdaccio/conf
      - ./plugins:/verdaccio/plugins
    networks: [web]

  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks: [web]

networks:
  web:

volumes:
  caddy_data:
  caddy_config:
```

### `/opt/verdaccio/Caddyfile`

```
npm.idcert.io {
  reverse_proxy verdaccio:4873
  encode gzip

  request_body {
    max_size 100MB
  }
}
```

### `/opt/verdaccio/conf/config.yaml`

```yaml
storage: /verdaccio/storage
plugins: /verdaccio/plugins

web:
  title: idcert npm
  enable: true

auth:
  htpasswd:
    file: /verdaccio/storage/htpasswd
    max_users: -1

uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true
    timeout: 30s

packages:
  '@idcert/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs
  '@*/*':
    access: $authenticated
    proxy: npmjs
  '**':
    access: $authenticated
    proxy: npmjs

server:
  keepAliveTimeout: 60

middlewares:
  audit:
    enabled: true

log: { type: stdout, format: pretty, level: warn }

listen:
  - 0.0.0.0:4873
```

### Permessi storage

```bash
sudo chown -R 10001:65533 /opt/verdaccio/storage /opt/verdaccio/plugins /opt/verdaccio/conf
```

(Verdaccio container gira come UID 10001.)

---

## 6. Avvio

```bash
cd /opt/verdaccio
docker compose up -d
docker compose logs -f
```

Caddy fetch certificato Let's Encrypt automatico (richiede DNS propagato).

Verifica:

```bash
curl -I https://npm.idcert.io/
# 200 OK → registry up
```

---

## 7. Utenti e token

Dal dev machine locale:

```bash
# utente personale
npm adduser --registry=https://npm.idcert.io/
# username: andrea
# password: <strong>
# email: aguiducci@idcert.io

# utente CI dedicato
npm adduser --registry=https://npm.idcert.io/
# username: ci-bot
# password: <strong>

# token long-lived per CI
npm token create --registry=https://npm.idcert.io/ --read-and-write
# copia token → Bitbucket repo variable VERDACCIO_TOKEN (secured)
```

---

## 8. Setup repo Bitbucket

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui

git remote remove origin
git remote add origin git@bitbucket.org:<workspace>/idcert-ui.git
git push -u origin main
```

Aggiorna `repository.url` in ogni `packages/*/package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "git+ssh://git@bitbucket.org/<workspace>/idcert-ui.git",
    "directory": "packages/ui"
  },
  "homepage": "https://bitbucket.org/<workspace>/idcert-ui",
  "bugs": "https://bitbucket.org/<workspace>/idcert-ui/issues",
  "publishConfig": {
    "registry": "https://npm.idcert.io/",
    "access": "restricted"
  }
}
```

---

## 9. `.npmrc` (root repo, commit)

```ini
@idcert:registry=https://npm.idcert.io/
//npm.idcert.io/:always-auth=true
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

Token locale (NO commit, va in `~/.npmrc`):

```bash
npm login --registry=https://npm.idcert.io/
# scrive auth token in ~/.npmrc
```

---

## 10. Bitbucket Pipelines

`bitbucket-pipelines.yml` (root repo):

```yaml
image: node:20

definitions:
  caches:
    pnpm: $HOME/.pnpm-store

pipelines:
  pull-requests:
    '**':
      - step:
          name: Build & Test
          caches: [pnpm]
          script:
            - corepack enable && corepack prepare pnpm@9.12.0 --activate
            - pnpm install --frozen-lockfile
            - pnpm build
            - pnpm test
            - pnpm typecheck
            - pnpm lint

  branches:
    main:
      - step:
          name: Release
          caches: [pnpm]
          deployment: production
          script:
            - corepack enable && corepack prepare pnpm@9.12.0 --activate
            - echo "//npm.idcert.io/:_authToken=$VERDACCIO_TOKEN" > ~/.npmrc
            - pnpm install --frozen-lockfile
            - pnpm build
            - pnpm changeset publish
```

Variabili Bitbucket repo settings → Repository variables (secured):

- `VERDACCIO_TOKEN` — token utente `ci-bot`

---

## 11. Test publish

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm build
cd packages/tokens
npm publish --registry=https://npm.idcert.io/
```

Verifica web UI: `https://npm.idcert.io/` → vedi `@idcert/tokens`.

---

## 12. Workflow release con Changesets

`changesets/action` GitHub-only. Su Bitbucket workflow manuale:

```bash
# dev locale: aggiungi changeset
pnpm changeset
git add .changeset && git commit -m "chore: changeset"
git push

# release: branch dedicato
git checkout -b release/v1.x
pnpm changeset version    # bump versioni + CHANGELOG
git commit -am "chore: version packages"
# PR a main → merge → pipeline `release` su main pubblica
```

---

## 13. Setup consumer (app cliente)

`.npmrc` consumer:

```ini
@idcert:registry=https://npm.idcert.io/
//npm.idcert.io/:_authToken=${VERDACCIO_TOKEN}
```

Install:

```bash
pnpm add @idcert/ui @idcert/tokens
pnpm add -D @idcert/tailwind-config
```

---

## 14. Backup

Cron giornaliero su VPS:

```bash
sudo tee /etc/cron.daily/verdaccio-backup > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /opt/backups/verdaccio-$DATE.tar.gz /opt/verdaccio/storage
find /opt/backups -name 'verdaccio-*.tar.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/verdaccio-backup
sudo mkdir -p /opt/backups
```

Bonus: rsync `/opt/backups/` → S3/B2 con `rclone` o `restic`.

---

## 15. Monitoring

```bash
docker compose logs --tail=100 -f verdaccio
docker stats
```

Alerting serio: Uptime Kuma o cron + curl + email.

---

## Sicurezza

- TLS obbligatorio (Caddy auto Let's Encrypt)
- `max_users: -1` blocca signup pubblico
- Token CI = utente dedicato `ci-bot`, scope publish solo su `@idcert/*`
- Backup `storage/` (rsync + cron)
- Firewall: porta 4873 solo container network, esponi solo 443 via Caddy
- 2FA su account Bitbucket
- Ruota `VERDACCIO_TOKEN` ogni 90 giorni

---

## Costo stimato

- VPS Hetzner CX22: €4.51/mese
- Dominio: riusa idcert.io subdomain (€0)
- Bitbucket Pipelines: 50 build min/mese gratis (Standard plan: $15/user/mese per più build)
- **Totale: ~€5/mese**

---

## Checklist finale

- [ ] VPS Hetzner provisionato
- [ ] DNS `npm.idcert.io` → VPS IP
- [ ] SSH solo key, no root, no password
- [ ] UFW: 22/80/443 only
- [ ] Docker + docker-compose installati
- [ ] `docker-compose.yml`, `Caddyfile`, `config.yaml` deployati
- [ ] HTTPS verde su `https://npm.idcert.io/`
- [ ] Utente personale + utente `ci-bot` creati
- [ ] Token CI generato → Bitbucket var `VERDACCIO_TOKEN`
- [ ] Repo migrato su Bitbucket
- [ ] `package.json` aggiornati con `repository` + `publishConfig`
- [ ] `.npmrc` root commit
- [ ] `bitbucket-pipelines.yml` deployato
- [ ] Test publish `@idcert/tokens` ok
- [ ] Backup cron attivo

---

## Riferimenti

- Verdaccio docs: https://verdaccio.org/docs/installation
- Caddy docs: https://caddyserver.com/docs/
- Bitbucket Pipelines: https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/
- Changesets: https://github.com/changesets/changesets
- Hetzner Cloud: https://docs.hetzner.com/cloud/

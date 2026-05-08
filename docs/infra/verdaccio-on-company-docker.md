# Verdaccio su server aziendale con Docker

Guida per deployare Verdaccio e pubblicare i pacchetti `@idcert/*` quando il
server aziendale ha **già Docker installato**. Niente provisioning VPS, niente
install Docker — solo deploy stack + workflow publish.

Assunzioni:

- Server Linux raggiungibile via SSH
- Docker + Docker Compose già installati e funzionanti
- User con permessi `docker` (gruppo o sudo)
- Possibilità di esporre porta 443 (o porta interna a piacere) verso rete
  aziendale / VPN
- DNS interno o pubblico assegnabile (es. `npm.idcert.local` o
  `npm.idcert.io`)

---

## 1. Verifica prerequisiti

```bash
ssh <user>@<server>

docker version
docker compose version
docker network ls
```

Verifica porte libere:

```bash
sudo ss -tlnp | grep -E ':(80|443|4873)'
```

Se 80/443 già occupati da altro reverse proxy aziendale (Nginx, Traefik,
HAProxy), salta la sezione Caddy e integra come **upstream** nel proxy
esistente.

---

## 2. Layout filesystem

```bash
sudo mkdir -p /opt/verdaccio/{storage,conf,plugins}
sudo chown -R $USER:$USER /opt/verdaccio
cd /opt/verdaccio
```

> Se le policy aziendali impongono altri path (es. `/srv/`, `/data/`),
> adatta. Il container monta path qualunque.

---

## 3. Configurazione Verdaccio

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
    max_users: -1   # disabilita signup pubblico

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

Container Verdaccio gira come UID **10001**:

```bash
sudo chown -R 10001:65533 /opt/verdaccio/storage /opt/verdaccio/plugins /opt/verdaccio/conf
```

---

## 4. Scenario A — server senza reverse proxy (deploy con Caddy)

Caddy gestisce TLS automatico (Let's Encrypt) se DNS pubblico e porte 80/443
aperte verso internet.

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

Per ambiente **interno con DNS aziendale** + TLS interno, sostituisci con:

```
npm.idcert.local {
  tls internal
  reverse_proxy verdaccio:4873
}
```

(Caddy genera CA self-signed → import cert su client.)

### Avvio

```bash
cd /opt/verdaccio
docker compose up -d
docker compose logs -f
```

Verifica:

```bash
curl -I https://npm.idcert.io/
```

---

## 5. Scenario B — server con reverse proxy aziendale esistente

Se sul server gira già Nginx / Traefik / HAProxy che termina TLS:

### `/opt/verdaccio/docker-compose.yml` (no Caddy)

```yaml
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    restart: unless-stopped
    ports:
      - "127.0.0.1:4873:4873"   # solo localhost, proxy aziendale fa upstream
    volumes:
      - ./storage:/verdaccio/storage
      - ./conf:/verdaccio/conf
      - ./plugins:/verdaccio/plugins
```

### Esempi config proxy

**Nginx** (`/etc/nginx/sites-available/verdaccio`):

```nginx
server {
  listen 443 ssl http2;
  server_name npm.idcert.io;

  ssl_certificate     /etc/letsencrypt/live/npm.idcert.io/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/npm.idcert.io/privkey.pem;

  client_max_body_size 100M;

  location / {
    proxy_pass http://127.0.0.1:4873;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/verdaccio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Traefik** (label su servizio Docker):

```yaml
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    restart: unless-stopped
    volumes:
      - ./storage:/verdaccio/storage
      - ./conf:/verdaccio/conf
      - ./plugins:/verdaccio/plugins
    networks: [traefik]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.verdaccio.rule=Host(`npm.idcert.io`)"
      - "traefik.http.routers.verdaccio.entrypoints=websecure"
      - "traefik.http.routers.verdaccio.tls.certresolver=le"
      - "traefik.http.services.verdaccio.loadbalancer.server.port=4873"

networks:
  traefik:
    external: true
```

---

## 6. Avvio + verifica

```bash
cd /opt/verdaccio
docker compose up -d
docker compose ps
docker compose logs --tail=100 verdaccio
```

Web UI: `https://npm.idcert.io/` → schermata Verdaccio.

API check:

```bash
curl -I https://npm.idcert.io/
curl https://npm.idcert.io/-/ping
```

---

## 7. Creazione utenti

Dal client (laptop dev), **non sul server**:

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
```

Genera token long-lived per CI / script:

```bash
npm token create --registry=https://npm.idcert.io/ --read-and-write
# salva token sicuro → vault aziendale, GitHub/Bitbucket secrets, ecc.
```

> `max_users: -1` blocca signup pubblico. Per aggiungere altri utenti, usa
> account già autenticato che esegue `npm adduser` (Verdaccio richiede admin
> esplicito solo se configurato).

Per gestione manuale `htpasswd`:

```bash
docker exec -it verdaccio sh
apk add apache2-utils    # se mancante
htpasswd -B /verdaccio/storage/htpasswd <username>
```

---

## 8. Setup `.npmrc` consumer

### Repo `idcert-ui` — `.npmrc` (root, commit)

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

### Token locale (NO commit, in `~/.npmrc`)

```bash
npm login --registry=https://npm.idcert.io/
# scrive _authToken in ~/.npmrc
```

### Apps consumer di `@idcert/*` — `.npmrc`

```ini
@idcert:registry=https://npm.idcert.io/
//npm.idcert.io/:_authToken=${VERDACCIO_TOKEN}
```

`VERDACCIO_TOKEN` da env / vault.

---

## 9. Aggiorna `package.json` dei pacchetti

In ogni `packages/*/package.json` aggiungi `publishConfig`:

```json
{
  "publishConfig": {
    "registry": "https://npm.idcert.io/",
    "access": "restricted"
  }
}
```

Forza publish solo verso Verdaccio anche se `npm publish` chiamato senza
flag `--registry`.

---

## 10. Build + publish pacchetti

### Manuale (prima volta o release ad-hoc)

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui

# build tutto monorepo
pnpm install
pnpm build

# publish singolo
cd packages/tokens
npm publish

cd ../tailwind-config
npm publish

cd ../ui
npm publish
```

Verifica pacchetti pubblicati:

```bash
curl https://npm.idcert.io/@idcert/ui | jq '.versions | keys'
```

Web UI mostra tutti `@idcert/*` con versioni.

### Workflow Changesets (consigliato)

```bash
# dev: aggiungi changeset per modifiche
pnpm changeset
git add .changeset && git commit -m "chore: changeset"
git push

# release locale
pnpm changeset version    # bump versioni + CHANGELOG
git commit -am "chore: version packages"
pnpm release              # build + changeset publish
git push --follow-tags
```

`pnpm release` esegue:

```
turbo run build --filter=./packages/* && changeset publish
```

`changeset publish` rispetta `publishConfig.registry` → punta Verdaccio.

### Workflow CI (Bitbucket Pipelines)

`bitbucket-pipelines.yml`:

```yaml
image: node:20

definitions:
  caches:
    pnpm: $HOME/.pnpm-store

pipelines:
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

Repo settings → Repository variables (secured):

- `VERDACCIO_TOKEN` — token utente `ci-bot`

> Se Bitbucket Pipelines non raggiunge `npm.idcert.io` (registry interno),
> usa Bitbucket **self-hosted runner** dentro rete aziendale.

---

## 11. Test consumer install

In nuova app:

```bash
mkdir test-consumer && cd test-consumer
pnpm init
echo "@idcert:registry=https://npm.idcert.io/" > .npmrc
pnpm add @idcert/ui @idcert/tokens
ls node_modules/@idcert/
```

OK → setup completo.

---

## 12. Operazioni comuni

```bash
# logs
docker compose logs --tail=200 -f verdaccio

# restart
docker compose restart verdaccio

# update Verdaccio
docker compose pull verdaccio
docker compose up -d verdaccio

# rimuovi versione singola pacchetto (CAUTION)
npm unpublish @idcert/ui@1.0.0 --registry=https://npm.idcert.io/

# stato storage
du -sh /opt/verdaccio/storage/
```

---

## 13. Backup

Cron giornaliero:

```bash
sudo tee /etc/cron.daily/verdaccio-backup > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
mkdir -p /opt/backups
tar -czf /opt/backups/verdaccio-$DATE.tar.gz /opt/verdaccio/storage
find /opt/backups -name 'verdaccio-*.tar.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/verdaccio-backup
```

Off-site con `restic` / `rclone` → S3 / Backblaze / NAS aziendale.

Restore:

```bash
docker compose down
sudo rm -rf /opt/verdaccio/storage/*
sudo tar -xzf /opt/backups/verdaccio-<DATE>.tar.gz -C /
sudo chown -R 10001:65533 /opt/verdaccio/storage
docker compose up -d
```

---

## 14. Sicurezza

- TLS obbligatorio (Caddy auto / Nginx con cert aziendale / Traefik)
- `max_users: -1` blocca signup pubblico
- Utente CI dedicato (`ci-bot`), token con scope publish solo `@idcert/*`
- Backup giornaliero + off-site
- Container Verdaccio bind solo `127.0.0.1` se reverse proxy esistente
- 2FA su account che hanno publish privilege
- Ruota token CI ogni 90 giorni
- Audit log: `docker compose logs verdaccio | grep -i publish`

---

## 15. Troubleshooting

**`npm publish` → 401 Unauthorized**

```bash
npm whoami --registry=https://npm.idcert.io/
# se errore → npm login
```

**`npm publish` → 403 Forbidden**

Pacchetto già pubblicato con stessa versione. Bump version o `npm unpublish`.

**Storage permission denied**

```bash
sudo chown -R 10001:65533 /opt/verdaccio/storage
```

**TLS cert error (Caddy)**

DNS non propagato o porte 80/443 bloccate. Verifica:

```bash
docker compose logs caddy
dig npm.idcert.io +short
```

**Container non parte**

```bash
docker compose ps
docker compose logs verdaccio
docker inspect verdaccio
```

---

## Checklist

- [ ] Path `/opt/verdaccio/{storage,conf,plugins}` creato
- [ ] `config.yaml` con `@idcert/*` rules
- [ ] Permessi storage UID 10001
- [ ] `docker-compose.yml` deployato (Scenario A o B)
- [ ] HTTPS verde su `https://npm.idcert.io/`
- [ ] Utente personale + `ci-bot` creati
- [ ] Token CI generato + salvato in vault
- [ ] `.npmrc` root + `publishConfig` in package.json
- [ ] `pnpm build && pnpm release` esegue senza errori
- [ ] Pacchetti `@idcert/{ui,tokens,tailwind-config}` visibili in web UI
- [ ] Test consumer install ok
- [ ] Backup cron attivo

---

## Riferimenti

- Verdaccio docs: https://verdaccio.org/docs/installation
- Caddy: https://caddyserver.com/docs/
- Changesets: https://github.com/changesets/changesets
- Pnpm publish: https://pnpm.io/cli/publish

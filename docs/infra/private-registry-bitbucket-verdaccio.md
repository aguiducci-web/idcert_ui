# Private npm Registry — Bitbucket + Verdaccio

Setup guide for hosting `@idcert/*` packages on a self-managed Verdaccio registry, with Bitbucket as the git host and Bitbucket Pipelines for automated publishing.

This is an alternative to GitHub + npmjs.org (private packages) — gives full control, no per-seat licensing, costs ~€4–6/month for hosting.

---

## 1. Where to run Verdaccio

Verdaccio needs a publicly reachable HTTPS endpoint.

| Host | Cost | Setup difficulty |
|---|---|---|
| **VPS** (Hetzner CX11, DigitalOcean droplet) | ~€4/month | Medium — SSH, Docker, manual TLS (Caddy/Traefik) |
| **Fly.io** | Free tier sufficient for low volume | Low — `fly launch` deploys Docker image, TLS automatic |
| **Railway / Render** | ~$5/month | Very low — connect Docker image, TLS automatic |
| **Home server + Cloudflare Tunnel** | Free | Medium — NAT/DNS, but no public ingress needed |

**Recommended:** Fly.io or Railway for first-time setup. Hetzner VPS if you want more control / lower long-term cost.

---

## 2. Verdaccio container config

### `docker-compose.yml`

```yaml
version: '3'
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    ports:
      - "4873:4873"
    volumes:
      - ./storage:/verdaccio/storage
      - ./conf:/verdaccio/conf
      - ./plugins:/verdaccio/plugins
    restart: unless-stopped
```

### `conf/config.yaml`

Key sections — copy the rest from the [Verdaccio default config](https://github.com/verdaccio/verdaccio/blob/master/conf/default.yaml):

```yaml
storage: /verdaccio/storage

auth:
  htpasswd:
    file: /verdaccio/storage/htpasswd
    max_users: 10        # cap signups; set to -1 to disable signup entirely after onboarding the team

packages:
  '@idcert/*':
    access: $authenticated   # only logged-in users can install
    publish: $authenticated  # only logged-in users can publish
    proxy: ''                # no upstream proxy for the @idcert scope (private only)
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs             # everything else is proxied from npmjs.org and cached locally

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

listen: 0.0.0.0:4873
```

Start the container:

```bash
docker-compose up -d
```

Verify it's reachable: `curl https://<your-host>/-/ping`.

---

## 3. Create users

On the server (or via `npm` from anywhere with the registry URL):

```bash
npm adduser --registry https://<your-host>/
```

Prompts for username/email/password. Credentials stored in `storage/htpasswd`. The first user is effectively admin (no separate role distinction in default Verdaccio).

Repeat for each team member, or have them run the command themselves.

---

## 4. Configure the monorepo to publish

### Root `.npmrc`

```
@idcert:registry=https://<your-host>/
//<your-host>/:_authToken=${NPM_TOKEN}
```

The `${NPM_TOKEN}` placeholder is read from environment — keeps secrets out of the repo.

### Per-package `publishConfig`

In `packages/ui/package.json`, `packages/tokens/package.json`, `packages/tailwind-config/package.json`:

```json
{
  "publishConfig": {
    "registry": "https://<your-host>/",
    "access": "restricted"
  }
}
```

`access: restricted` is the npm convention for private scoped packages — Verdaccio honors it.

### Generate a long-lived token

After `npm adduser`, generate a token for CI / scripted use:

```bash
npm token create --registry https://<your-host>/
```

Save the token in 1Password / Bitwarden. You'll need it for:
- Bitbucket Pipelines (repo variable `NPM_TOKEN`)
- Local dev publishing (export `NPM_TOKEN` in shell)

### Test local publish

```bash
NPM_TOKEN=<token> pnpm exec changeset publish
```

Verify on Verdaccio's web UI (`https://<your-host>/`) that the packages appear.

---

## 5. Bitbucket Pipelines for automated release

### `bitbucket-pipelines.yml` (repo root)

```yaml
image: node:20

pipelines:
  branches:
    main:
      - step:
          name: Release
          caches:
            - node
          script:
            - corepack enable
            - corepack prepare pnpm@9 --activate
            - pnpm install --frozen-lockfile
            - pnpm test
            - pnpm build
            - echo "@idcert:registry=https://${VERDACCIO_HOST}/" > .npmrc
            - echo "//${VERDACCIO_HOST}/:_authToken=${NPM_TOKEN}" >> .npmrc
            - pnpm exec changeset version
            - git config user.email "ci@idcert.io"
            - git config user.name "Bitbucket Pipelines"
            - git add -A && git commit -m "chore: version packages [skip ci]" || true
            - pnpm exec changeset publish
            - git push origin main --tags
```

### Bitbucket repo variables

In the Bitbucket UI → Repository settings → **Repository variables**:

| Name | Type | Value |
|---|---|---|
| `NPM_TOKEN` | Secured | Token from step 4 |
| `VERDACCIO_HOST` | Plain | e.g. `npm.idcert.io` |

### How the pipeline works

1. Install + test + build to verify the commit ships clean.
2. Write a runtime `.npmrc` with the auth token (never committed — rebuilt each run).
3. `changeset version` consumes any pending changesets, bumps `package.json` versions, regenerates `CHANGELOG.md`. If no changesets are pending, this is a no-op.
4. Commit the version bump back to `main` with `[skip ci]` so the release commit doesn't re-trigger the pipeline.
5. `changeset publish` publishes any package whose version is newer than the registry's latest. Idempotent — running twice publishes nothing the second time.
6. Push tags so the registry release matches the git history.

### Trigger a release

Merge a PR (or commit directly) to `main` that includes a changeset file in `.changeset/`. The pipeline does the rest.

To create a changeset locally:

```bash
pnpm exec changeset
# answer prompts: which packages, bump type (patch/minor/major), summary
```

Commit the generated `.changeset/<random-name>.md` along with the code change.

---

## 6. Consumer-side setup

Any other project that consumes `@idcert/ui` needs to know where to fetch it.

### Project `.npmrc`

```
@idcert:registry=https://<your-host>/
//<your-host>/:_authToken=${NPM_TOKEN}
```

### Local dev login

```bash
npm login --registry https://<your-host>/
```

Stores the token in `~/.npmrc`. Done once per machine.

### CI

Set `NPM_TOKEN` as a secret/variable in the consumer's CI. Same `.npmrc` template works.

---

## 7. Backup

Verdaccio data lives entirely in the `./storage` volume:
- `htpasswd` — user credentials
- `<scope>/<name>/` — published tarballs and metadata

Daily backup of this volume is sufficient for full disaster recovery.

Cheap option: `restic` to Backblaze B2 (~€1/month for tens of GB). Cron line on the server:

```cron
0 3 * * * restic -r b2:idcert-verdaccio-backup backup /path/to/storage
```

Test restore at least once before relying on it.

---

## Suggested execution order (first-time setup)

1. **Hosting** — Pick Fly.io or Railway. `fly launch` starting from `verdaccio/verdaccio` image, or Railway's "Deploy from Docker image".
2. **DNS** — Point a subdomain (e.g. `npm.idcert.io`) at the host. TLS handled by the platform.
3. **Admin user** — `npm adduser --registry https://npm.idcert.io/`.
4. **Token** — `npm token create`. Save in password manager.
5. **Repo** — `git remote add origin <bitbucket-url>` on the local clone, push `main` and tags.
6. **Bitbucket variables** — `NPM_TOKEN` (secured) and `VERDACCIO_HOST`.
7. **First publish** — Either trigger the pipeline (commit a changeset to main) or publish manually with `NPM_TOKEN=<token> pnpm exec changeset publish` to verify.
8. **Backup** — Set up `restic` cron once everything works.

Total time: ~2–3 hours end-to-end. Day-to-day maintenance: near zero (Verdaccio is stable; bumping the Docker image once a year is enough).

---

## Costs (estimate)

| Item | Monthly |
|---|---|
| Fly.io (Verdaccio) | €0–5 (free tier covers low volume) |
| DNS subdomain | included with existing domain |
| Backups (B2 + restic) | ~€1 |
| Bitbucket Cloud (free plan up to 5 users) | €0 |
| **Total** | **~€1–6/month** |

Compare: npmjs.org Pro for orgs is ~€7/user/month. For a 3-person team, self-hosting saves ~€20/month and gives you full control.

---

## When to NOT do this

- You need >100 packages or >50 daily downloads from many regions — at that scale a managed registry (Cloudsmith, JFrog) is worth the cost.
- Nobody on the team is comfortable maintaining a Linux container — pay for npmjs.org Pro instead.
- You need SSO/SAML — Verdaccio default doesn't ship that. Plugins exist but add complexity.

For a small team building an internal design system, the self-hosted setup is the right tradeoff.

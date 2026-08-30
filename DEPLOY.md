# Deploying diwche.com

The site is static. It builds to `dist/`, ships as an nginx image, and runs on the NAS
next to the other apps. Nothing here is specific to Astro beyond the build step.

```
push to main ──▶ Gitea Actions ──▶ registry ──▶ NAS container ──▶ Cloudflare tunnel ──▶ diwche.com
                 (build+push)      git.hela…    diwche-site:5659    (already running)
```

## The pieces

| Piece            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| Repo             | `git.helabyte.com/hela/diwche-site`                    |
| Image            | `git.helabyte.com/hela/diwche-site:<sha>` (+ `:latest`)|
| Container        | `diwche-site`                                          |
| Host port        | `5659` → 80 in the container                           |
| Health check     | `http://192.168.1.100:5659/healthz` → `ok`             |
| Workflow         | `.gitea/workflows/deploy.yml`                          |

Port 5659 was picked because 5655 (accounting), 5656 (sma-fe) and 5658 (home-abroad-fe)
are taken.

## One-time setup

### 1. Gitea repo secrets and variables

The workflow uses exactly the same names as the other deployments in this NAS, so if the
org-level secrets are inherited there is nothing to do. Otherwise set, on the repo:

- Variables: `REGISTRY_USER`, `SSH_HOST`, `SSH_USER`
- Secrets: `REGISTRY_TOKEN`, `SSH_PASS` and/or `SSH_PRIVATE_KEY`

### 2. Cloudflare tunnel — add the public hostname

The NAS runs one cloudflared container (`Unraid-Cloudflared-Tunnel`) with a **token**, so
its routing lives in the Cloudflare dashboard, not on the NAS. Nothing on the box needs
to change; you add a hostname to the existing tunnel:

1. Cloudflare Zero Trust → Networks → Tunnels → the existing tunnel → **Public Hostname**
2. Add:
   - Domain: `diwche.com`, subdomain empty
   - Service: `HTTP` → `192.168.1.100:5659`
3. Repeat for `www.diwche.com` if you want it to resolve (or add a redirect rule at the
   edge — see below).

Cloudflare terminates TLS at the edge, so the container never needs a certificate and the
site does **not** have to go through Nginx Proxy Manager. That is why this differs from
`sma.helabyte.com`, whose tunnel rule points back at NPM for a Let's Encrypt cert: the
SMA app needs that hostname to work on the LAN too. The marketing site does not.

**Prerequisite:** `diwche.com` has to be a zone in the *same* Cloudflare account as the
tunnel (account id `7ca6849e…`). If the domain sits in another account, either move the
zone or run a second cloudflared with that account's token — a tunnel can only route
hostnames belonging to its own account.

### 3. Optional — www → apex

Cloudflare → the `diwche.com` zone → Rules → Redirect Rules: `www.diwche.com/*` →
`https://diwche.com/$1`, 301. Cheaper than a second tunnel hostname.

### 4. Optional — uptime monitoring

Uptime Kuma already runs on the NAS (`:3001`). Add an HTTP monitor on
`https://diwche.com/healthz` expecting `200`.

## Deploying

Push to `main`. The workflow builds the image, pushes it, then over SSH pulls it on the
NAS, replaces the container, and fails the run if `/healthz` or `/` doesn't answer within
15 seconds — so a broken build shows up red instead of silently serving a blank site.

Manual deploy of the current `main`, if you ever need it:

```bash
ssh root@192.168.1.100 \
  'docker pull git.helabyte.com/hela/diwche-site:latest \
   && docker rm -f diwche-site \
   && docker run -d --name diwche-site --restart always -p 5659:80 \
        git.helabyte.com/hela/diwche-site:latest'
```

## Build inputs that must be committed

The Docker build only copies `astro.config.mjs`, `src/` and `public/`. Two generated
directories under `public/` are therefore **committed on purpose**, because CI has no way
to regenerate them:

- `public/mascot/` — the ~770KB shippable slice of `mascot/dist`, produced by
  `npm run mascot:sync`. `mascot/dist` itself stays ignored (22MB, and rebuilding it needs
  the Python pipeline in `mascot/build/`). **Re-run `mascot:sync` and commit the result
  whenever the art changes**, or the deployed site keeps the old mascot.
- `public/shots/_placeholder-*.svg` — the hand-drawn placeholders. Real screenshots stay
  ignored until they've had a credential review.

## Caching

`/_astro/*` is content-hashed by the build and pinned for a year. `/mascot/*` and
`/shots/*` keep stable filenames across deploys, so they revalidate hourly. HTML is never
cached. If you ever add Cloudflare edge caching, purge it on deploy or the HTML rule above
stops being the only thing that matters.

## The public read

The funnel at `/read` — and the hero CTA that points at it — is built only when
`PUBLIC_READ=on` is set at build time. It defaults to **off**, because the show
talks to `/api/public/*` on the backend and that does not exist yet — shipping
the field before it does would put a call to action on the live site whose only
outcome is an apology.

With the flag off, `/read` still builds and still walks end to end — it carries
a preview banner saying the read at the end will not run, and the homepage does
not link to it. Nothing is indexed and nothing links in, so the only people who
arrive are the ones who typed the URL, which is exactly who needs to review it
while it is being built.

To turn it on, in this order:

1. Deploy the backend with `/api/public/**` served (`com.sma.publicaudit`).
2. Confirm the NAS address and port in the `location /api/public/` block in
   `nginx.conf` still match that container.
3. Add `--build-arg PUBLIC_READ=on` to the `docker build` line in
   `.gitea/workflows/deploy.yml`. The `ARG` it feeds is already in the
   Dockerfile, so that one line is the whole switch.
4. Set the Turnstile site key on the document root
   (`data-turnstile-key`) — until it is present the page loads no third-party
   script at all, and the backend decides whether a missing token is acceptable.

Locally `npm run dev` sets the flag on for you and serves `/api/public/*` from
`mock/server.mjs`. Point it at a real backend with
`PUBLIC_API_ORIGIN=http://host:5556 npm run dev`, which skips the fixtures.

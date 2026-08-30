# Diwche marketing site — static Astro build served by nginx.
#
# Two stages so CI needs nothing but Docker: node builds, nginx serves. The
# runtime image carries no node_modules and no build tooling, just dist/.

FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first, so a content-only change reuses this layer.
COPY package.json package-lock.json ./
RUN npm ci

# Only what `astro build` actually reads. mascot/, design/, scripts/ and
# .claude/ are authoring material — they never reach the site. The shippable
# slice of the mascot already lives in public/mascot (committed; produced
# locally by `npm run mascot:sync`).
COPY astro.config.mjs ./
COPY src ./src
COPY public ./public

# Whether the funnel at /read is wired to the backend. Unset means the page
# still builds and still walks — it just carries a preview banner and the
# homepage does not link to it. Flip it by passing
# `--build-arg PUBLIC_READ=on` from the workflow, once /api/public/* is served.
ARG PUBLIC_READ
# The Turnstile site key is public by nature — it is read out of the page. The
# secret that verifies the token it mints lives only on the backend. With this
# unset the page loads nothing from Cloudflare and mints no token, and the
# backend decides whether that is acceptable.
ARG PUBLIC_TURNSTILE_KEY
ENV PUBLIC_READ=$PUBLIC_READ
ENV PUBLIC_TURNSTILE_KEY=$PUBLIC_TURNSTILE_KEY

RUN npm run build

FROM nginx:alpine
LABEL maintainer="Diwche"

COPY --from=build /app/dist/ /usr/share/nginx/html/
# A template, not a finished config: nginx's own entrypoint runs envsubst over
# /etc/nginx/templates/*.template at container start, so READ_GATE arrives from
# the environment at `docker run` rather than being baked into the image. Only
# variables that exist in the environment are substituted, which is why $host
# and $remote_addr survive untouched.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY security-headers.conf /etc/nginx/conf.d/security-headers.conf

# nginx listens on 80 inside the container; the host maps 5659:80 in docker run
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

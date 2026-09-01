# Diwche marketing site — static Astro build served by nginx.
#
# Two stages so CI needs nothing but Docker: node builds, nginx serves. The
# runtime image carries no node_modules and no build tooling, just dist/.

FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first, so a content-only change reuses this layer.
#
# --omit=dev matters more than it looks. The only devDependency is puppeteer,
# whose postinstall downloads a ~150MB Chromium — on a runner whose DNS is
# already unreliable, that is twelve minutes of build time and a coin flip. It
# is authoring tooling: `npm run shoot` captures the app's own screens on a
# laptop, and the results are committed. The site build never opens a browser.
#
# Everything astro build actually reads — the three font families included —
# is a real dependency, and is declared as one.
COPY package.json package-lock.json ./
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci --omit=dev

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
# secret that verifies the token it mints lives only on the backend. It has a
# default here, rather than living only in a CI variable, because an unset CI
# variable substitutes to an empty string without a word of complaint: the site
# then mints no token, the backend refuses every read for want of one, and the
# only place that failure is visible is a visitor's screen. In the repo it is
# reviewable, and it deploys with the code that depends on it.
ARG PUBLIC_TURNSTILE_KEY=0x4AAAAAAEjTcYgQzoS-ddmf
ENV PUBLIC_READ=$PUBLIC_READ
ENV PUBLIC_TURNSTILE_KEY=$PUBLIC_TURNSTILE_KEY

# The two halves of the proof-of-human check live in different repos, so nothing
# but this stops them drifting apart. A read that is wired to the backend and
# carries no site key is refused on every request, so it is better to lose the
# build than to ship a funnel that cannot be walked.
RUN if [ "$PUBLIC_READ" = "on" ] && [ -z "$PUBLIC_TURNSTILE_KEY" ]; then \
      echo "PUBLIC_READ=on but PUBLIC_TURNSTILE_KEY is empty. The page would mint" >&2; \
      echo "no Turnstile token and the backend would refuse every read." >&2; \
      exit 1; \
    fi

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

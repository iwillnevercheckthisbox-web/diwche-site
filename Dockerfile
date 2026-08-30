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
ENV PUBLIC_READ=$PUBLIC_READ

RUN npm run build

FROM nginx:alpine
LABEL maintainer="Diwche"

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/conf.d/security-headers.conf

# nginx listens on 80 inside the container; the host maps 5659:80 in docker run
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

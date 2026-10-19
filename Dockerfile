
# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


# Stage 2: Build Next.js
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ARG NEXT_PUBLIC_BACKEND_URL=https://api.pet-shop.mahdi-rashidi.space/api

ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build


# Stage 3: Caddy binary source
FROM caddy:2-alpine AS caddy-source


# Stage 4: Minimal production image
FROM scratch AS runner

# Copy Caddy executable
COPY --from=caddy-source /usr/bin/caddy /usr/bin/caddy

# Copy trusted CA certificates
COPY --from=caddy-source \
    /etc/ssl/certs/ca-certificates.crt \
    /etc/ssl/certs/ca-certificates.crt

# Copy static Next.js output
COPY --from=builder /app/out /srv

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

WORKDIR /srv

ENV XDG_CONFIG_HOME=/tmp/caddy/config
ENV XDG_DATA_HOME=/tmp/caddy/data

EXPOSE 80

ENTRYPOINT ["/usr/bin/caddy"]

CMD ["run", "--config", "/etc/caddy/Caddyfile"]

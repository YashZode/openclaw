# Stage 1: Build the React app
FROM node:22-slim AS builder
ARG VITE_DEV_MODE
ARG VITE_MAPBOX_TOKEN
ENV VITE_DEV_MODE=$VITE_DEV_MODE
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Caddy (auto-TLS via Let's Encrypt)
FROM caddy:2-alpine
COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443

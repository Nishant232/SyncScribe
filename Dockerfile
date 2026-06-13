# ── Stage 1: Build Frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

# Accept both NEXT_PUBLIC_* and plain SUPABASE_* so only one set of secrets is needed
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/ .
RUN npm run build

# ── Stage 2: Build Backend ───────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /build

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npm run build

# ── Stage 3: Production Runner ───────────────────────────────────────
FROM node:20-alpine
RUN apk add --no-cache nginx supervisor

# Frontend — Next.js standalone bundle
COPY --from=frontend-builder /build/.next/standalone  /app/frontend
COPY --from=frontend-builder /build/.next/static      /app/frontend/.next/static

# Copy public folder only if it exists (use a wildcard to avoid failure on empty dir)
COPY --from=frontend-builder /build/public/           /app/frontend/public/

# Backend — compiled JS
COPY --from=backend-builder /build/dist /app/backend/dist

# Install backend production dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Config files
COPY nginx.conf       /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

WORKDIR /app

# HF Spaces requires port 7860
EXPOSE 7860

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]

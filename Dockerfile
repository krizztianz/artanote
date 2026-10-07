# syntax=docker/dockerfile:1

#################################
# 1. deps: install dependencies
#################################
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

#################################
# 2. builder: build the Next.js app
#################################
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# DATABASE_URL is only needed at build time for Prisma client generation
# (handled by postinstall), the schema does not need a live DB connection.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

#################################
# 3. migrator: full node_modules + Prisma CLI, used only to run
#    `prisma migrate deploy` as a one-off container before the app starts.
#    The Next.js standalone output in `runner` is pruned and does not carry
#    enough of the Prisma CLI's own dependency tree to run migrations.
#################################
FROM node:20-alpine AS migrator
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package.json ./package.json

CMD ["node_modules/.bin/prisma", "migrate", "deploy"]

#################################
# 4. runner: minimal production image
#################################
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone server output + static assets + public folder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY ./package*.json ./
RUN npm i

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/instrumentation.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/.next/ ./.next

USER nextjs

ENV PORT 3001
EXPOSE ${PORT}

ENTRYPOINT npm start

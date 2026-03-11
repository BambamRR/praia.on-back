# ───── Build stage ─────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# ───── Runtime stage ─────
FROM node:20-alpine AS runner

RUN addgroup -S praion && adduser -S praion -G praion

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src           ./src
COPY --from=builder /app/package.json  ./package.json
COPY --from=builder /app/.sequelizerc  ./.sequelizerc

RUN mkdir -p logs && chown -R praion:praion /app

USER praion

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/entrypoint/server.js"]

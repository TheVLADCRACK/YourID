FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl netcat-openbsd

FROM base AS deps
COPY package*.json ./
RUN npm install --production --legacy-peer-deps --silent

FROM base AS builder
COPY package*.json ./
RUN npm install --legacy-peer-deps --silent
COPY . .
# Pin Prisma CLI to v6.1.0 to match project schema and avoid Prisma v7 interactive prompts
RUN npx prisma@6.1.0 generate --schema=./prisma/schema.prisma
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]

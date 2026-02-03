ARG BASE_IMAGE=node:20-alpine
FROM ${BASE_IMAGE} AS deps
RUN apk add --no-cache libc6-compat git
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Rebuild the source code only when needed
FROM ${BASE_IMAGE} AS builder
WORKDIR /app
ENV NODE_ENV production
COPY --from=deps /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

USER root

EXPOSE 5000

CMD [ "node", "dist/src/server.js" ]


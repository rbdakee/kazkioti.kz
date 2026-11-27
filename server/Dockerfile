# Build from the repository root so the shared content schemas are included:
#   docker build -f server/Dockerfile -t kazkioti-cms .
FROM node:22-bookworm-slim

WORKDIR /app/server
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./
RUN corepack enable \
  && apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && pnpm install --frozen-lockfile --prod \
  && apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY shared /app/shared
COPY server/src ./src
COPY server/scripts ./scripts
COPY server/seed ./seed
# shared/ imports zod; let it resolve the server's copy.
RUN ln -s /app/server/node_modules /app/node_modules \
  && mkdir /data && chown node:node /data

ENV NODE_ENV=production PORT=4000 DATA_DIR=/data
VOLUME /data
EXPOSE 4000
USER node
CMD ["node", "--import", "tsx", "src/index.ts"]

# Stage 1 (builder): install all dependencies including devDependencies.
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Stage 2 (runtime): start from a clean image and copy only what is needed.
# This keeps the final image smaller by excluding devDependencies and build artifacts.
FROM node:20-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app .

# Run as the built-in non-root "node" user to limit the process's system privileges.
USER node

CMD [ "npm", "start" ]
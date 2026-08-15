# Build and run the Meteor app entirely inside Docker:
#   docker compose up --build
#
# Stage 1 installs the Meteor CLI, installs npm dependencies with
# `meteor npm`, and builds the production server bundle with
# `meteor build`. Stage 2 runs the bundle on a plain Node.js image
# (Node 24 matches the Node version bundled with Meteor 3.5.1).

FROM node:24-slim AS build

# Docker build steps run as root
ENV METEOR_ALLOW_SUPERUSER=true

# Install the Meteor CLI matching .meteor/release
RUN npm install -g meteor@3.5.1

WORKDIR /source

# Install npm dependencies first so this layer caches independently
# of app code changes
COPY package.json package-lock.json ./
RUN meteor npm ci

# Build the production server bundle
COPY . .
RUN meteor build /build --server-only --directory

# Install the server's production npm dependencies (rebuilds native
# modules such as bcrypt against the image's Node version)
WORKDIR /build/bundle/programs/server
RUN npm install --omit=dev

FROM node:24-slim

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app
COPY --from=build --chown=node:node /build/bundle /app

USER node
EXPOSE 3000

CMD ["node", "main.js"]

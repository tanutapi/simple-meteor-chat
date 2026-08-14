# Plain Node.js image running the Meteor server bundle.
#
# Build the server bundle first (from the app root):
#   meteor build ./output --server-only
# Then build and run the containers:
#   docker compose up --build
#
# Node 24 matches the Node version bundled with Meteor 3.5.1.

FROM node:24-slim AS build

WORKDIR /build
COPY output/simple-meteor-chat.tar.gz .
RUN tar -xzf simple-meteor-chat.tar.gz && rm simple-meteor-chat.tar.gz

# Install the server's production npm dependencies (rebuilds native modules
# such as bcrypt against the image's Node version).
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

ARG NODE_VERSION=22.13.1

FROM node:${NODE_VERSION}-alpine
ENV NODE_ENV=production

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER 4242:4242
COPY . .

CMD node test.js

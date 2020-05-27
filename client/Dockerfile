FROM node:14.2.0-alpine AS builder

WORKDIR /usr/src/app

COPY ./education-platform/package*.json ./

RUN npm i

COPY ./education-platform ./

RUN npm run build:ssr



FROM node:14.2.0-alpine

COPY --from=builder /usr/src/app/dist /dist

ENTRYPOINT ["nice", "-10", "node", "/dist/education-platform/server/main.js"]

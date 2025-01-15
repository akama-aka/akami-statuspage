FROM node:22.8-alpine3.19

LABEL authors="Akama Aka <akama.aka@kitsune.exposed>"
LABEL org.opencontainers.image.licenses="ASPL 1.0"
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.description="Aki Solutions CDN CGI that serves content for Aki Solutions Services"
ENV VERSION = 2.0.1-DEV \
    SERVER_HOSTNAME = 127.0.0.1 \
    SERVER_PORT = 8081 \
    SERVER_LOG_LEVEL = info \
    PATH_IDENTIFIER = aki-cgi \
    ASSETS_CACHE_TTL=2592000 \
    IP_DATA_CACHE_TTL=7884000000 \
    XRAY_RESOLVER_UA="My-CDN/2.0.1-DEV"

RUN apk update
RUN npm i -g fastify-cli
RUN mkdir /opt/server
RUN chown node:node /opt/server
USER node
WORKDIR /opt/server
COPY --chown=node:node ./ /opt/server
RUN npm ci
CMD [ "npm", "run","server"]
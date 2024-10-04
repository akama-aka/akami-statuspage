FROM node:22.8-alpine3.19
LABEL authors="Akama Aka"
LABEL org.opencontainers.image.licenses="CC-BY-NC-ND 4.0"
ENV VERSION=1.1.2 \
    SERVER_PORT=8080 \
    SERVER_HOSTNAME=127.0.0.1 \
    SERVER_LOG_LEVEL=info \
    PATH_IDENTIFIER=akami-cgi \
    ASSETS_CACHE_TTL=2592000 \
    IP_DATA_CACHE_TTL=7884000000 \
    XRAY_RESOLVER_UA="Aki-CDN/1.1.2-DEV"
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.description="An custom CDN-CGI Server for 4xx,5xx Status Response Sites."
RUN apk update
RUN npm i -g fastify-cli
RUN mkdir /opt/server
RUN chown node:node /opt/server
USER node
WORKDIR /opt/server
COPY --chown=node:node ./ /opt/server
RUN npm ci
EXPOSE $SERVER_PORT
CMD [ "npm", "run","server"]

FROM node:21-alpine
LABEL authors="Akama Aka"
LABEL org.opencontainers.image.license="CC-BY-NC-ND 4.0"
ENV VERSION=1.0.0.2 \
    SERVER_PORT=8080 \
    SERVER_HOSTNAME=127.0.0.1 \
    SERVER_LOG_LEVEL=info \
    PATH_IDENTIFIER=akami-cgi
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.description="An custom CDN-CGI Server for 4xx,5xx Status Response Sites."
RUN npm i -g fastify-cli
RUN mkdir /opt/server
RUN chown node:node /opt/server
USER node
WORKDIR /opt/server
COPY --chown=node:node ./ /opt/server
RUN npm i
EXPOSE $SERVER_PORT
CMD [ "npm", "run","server"]
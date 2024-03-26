FROM node:21-alpine
LABEL authors="Akama Aka"
RUN npm i -g fastify-cli
RUN mkdir /opt/server
RUN chown node:node /opt/server
USER node
WORKDIR /opt/server
COPY --chown=node:node ./ /opt/server

RUN npm i
EXPOSE 3000
CMD [ "npm", "start"]
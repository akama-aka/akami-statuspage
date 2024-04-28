# Akami Solutions CDN CGI Server

## Description

The Akami Solutions CDN CGI Server represents a modernized version of the previous Akami Solutions CDN CGI missing pages.

As of the current status (March 26, 2024), an independent PHP file was generated for each HTTP status code. 
Using a reverse proxy, requests were forwarded to the respective file depending on the HTTP status code. In contrast, 
the current version works with an additional web server that can operate on any port. This allows requests containing 
`cdn-cgi` to be forwarded to this server using a reverse proxy.

## Functionality

To illustrate how this system works, let's take the example of a web hosting provider that uses NGINX and this Node.js server.

The website host configures NGINX so that when the path `/akami-cgi/` appears in the URL, the request is redirected to this server. 
In practice, this means that when such a call is made, the normal loading of the website is interrupted and the 
Akami Solutions CDN CGI server takes control instead.

## Installation and setup

Setting up the Akami Solutions CDN CGI server requires the following steps:

1. First, install the Node.js server using `npm` or the package manager of your choice.
2. Then create a corresponding configuration file for NGINX.
3. Then update the path in the configuration file to direct `/akami-cgi/` to your Node.js server.

The exact setup details and examples can be found in the installation instructions.

## Support and troubleshooting

For support and troubleshooting, please take a look at the FAQ or the user forum. For more serious problems, 
please do not hesitate to contact our customer service.

## Docker support

## Docker support

Akami Solutions CDN CGI Server provides full support for [Docker](https://www.docker.com/). You can use a Docker 
container to easily deploy and manage the server. We provide a pre-built Dockerfile that simplifies container setup: 
you may need to use different identifiers, tags or ports depending on your specific application and configuration. 
Please see the Docker documentation for more details.

```dockerfile
FROM node:21-alpine
LABEL authors="Akama Aka"
RUN npm i -g fastify-cli
RUN mkdir /opt/server
RUN chown node:node /opt/server
USER node
WORKDIR /opt/server
COPY --chown=node:node ./ /opt/server
RUN npm i
EXPOSURE 3000
CMD["npm","start"]
```

You can use this Dockerfile to create a Docker image and run the CDN CGI Server in a Docker container. 
To build the Docker image and start the container, please use the following commands:

1. Build the Docker image:

```bash
docker build -t akami-cdn-cgi-server:1.0 .
```

2. Start the Docker container:

```bash
docker run -p 3000:3000 -d akami-cdn-cgi-server:1.0
```

Please note that you may need to use different identifiers, tags or ports depending on your specific application and 
configuration. For more information about using Docker, see the [official Docker documentation](https://docs.docker.com/get-started/overview/).


> [!IMPORTANT]
> This is not a 100% production representation that Akami Solutions uses. Akami Solutions uses a better, cleaner and more maintained Version of the Code
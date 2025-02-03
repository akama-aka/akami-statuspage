# Aki Solutions CDN CGI Server

## Description

The Aki Solutions CDN CGI Server represents a modernized version of the previous Aki Solutions CDN CGI missing pages.

As of the current status (March 26, 2024), an independent PHP file was generated for each HTTP status code.
Using a reverse proxy, requests were forwarded to the respective file depending on the HTTP status code. In contrast,
the current version works with an additional web server that can operate on any port. This allows requests
containingDefault:
`cdn-cgi` to be forwarded to this server using a reverse proxy.

## Functionality

To illustrate how this system works, let's take the example of a web hosting provider that uses NGINX and this Node.js server.

The website host configures NGINX so that when the path `/aki-cgi/` appears in the URL, the request is redirected to
this server.
In practice, this means that when such a call is made, the normal loading of the website is interrupted and the
Aki Solutions CDN CGI server takes control instead.

## Environment Variables

The system utilizes the following environment variables:

| ENV Name           | Description                                                                              | Default   | Required? |
|--------------------|------------------------------------------------------------------------------------------|-----------|-----------|
| `VERSION`          | represents the version number of the server.                                             | null      | false     |
| `SERVER_PORT`      | represents the port on which the server listens.                                         | 8081      | true      |
| `SERVER_HOSTNAME`  | represents the hostname for the server. (INFO: Has to be 0.0.0.0 if you use a Container) | 127.0.0.1 | true      |
| `SERVER_LOG_LEVEL` | determines the log level used by the server. (INFO: Will be deprecated soon)             | info      | false     |
| `REDIS_HOST`       | Hostname of the Redis Server                                                             | null      | true      |
| `PATH_IDENTIFIER`  | indicates the path name in the URL for which requests will be redirected to this server. | aki-cgi   | true      |
| `LOGGING`          | Enables Fastify Logging                                                                  | false     | false     |

## Installation and setup

Setting up the Aki Solutions CDN CGI server requires the following steps:

1. First, install the Node.js server from the [https://nodejs.org](nodejs.org) Website.
2. Then create a corresponding configuration file for NGINX.
3. Install the Source Code from the GitHub Repository
4. Then update the path in the configuration file to direct `/aki-cgi/` to the path you've setup in your .env File.
5. Lastly, set the environment variables in your system accordingly.

## Docker support

Aki Solutions CDN CGI Server provides full support for [Docker](https://www.docker.com/). You can use a Docker
container to easily deploy and manage the server. We provide a pre-built Dockerfile that simplifies container setup:
you may need to use different identifiers, tags or ports depending on your specific application and configuration.
Please see the Docker documentation for more details.
You can use this Dockerfile to create a Docker image and run the CDN CGI Server in a Docker container. To build the Docker image and start the container, please use the following commands:

1. Build the Docker image:
```shell
docker build -t cdn-cgi .
```
2. Start the Docker container:
```shell
docker run -p 3000:3000 -d cdn-cgi
```
Please note that you may need to use different identifiers, tags or ports depending on your specific application and configuration. For more information about using Docker, see the [official Docker documentation](https://docs.docker.com/get-started/overview/).
## Docker-Compose
In addition to Docker support, the CDN CGI Server can be also operated using Docker Compose.
Below is a sample docker-compose.yml that gives an example of how Docker Compose can launch the service:
```yaml
version: "3.8"
services:
  cdn-cgi-server:
    image: ghcr.io/akama-aka/cdn-cgi:2.1.0
    environment:
      - VERSION=2.1.0
      - SERVER_PORT=8080
      - SERVER_HOSTNAME=127.0.0.1
      - SERVER_LOG_LEVEL=info
      - PATH_IDENTIFIER=aki-cgi
      - LOGGING = false
    ports:
      - 8080:8081 
```
To start the Docker Compose stack use this command:
```shell
docker compose up -d
```
## Support and troubleshooting

For support and troubleshooting, please get in contact with me via [mail](mailto://akama.aka@kitsune.exposed). For more
serious problems, please do not hesitate to contact me!
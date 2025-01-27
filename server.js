'use strict'
const console = require("node:console");
require('dotenv').config()
const {join, basename, normalize, resolve} = require("node:path");
const {createReadStream, path} = require("fs");
const rateLimit = require("@fastify/rate-limit");
// Fastify
const server = require('fastify')({logger: true})
    .register(rateLimit, {
        max: 100, // maximum number of requests
        timeWindow: '15 minutes' // time window for the rate limit
    });

// Server Routing Mechanic

require(__dirname + '/controllers/xray').forEach(loadRoute)
require(__dirname + '/controllers/status').forEach(loadRoute)

function loadRoute(routeOption) {
    server.route(routeOption);
}

if (!process.env.ASSETS_CACHE_TTL) {
    process.env.ASSETS_CACHE_TTL = 2592000;
}
server
    .get(`/${process.env.PATH_IDENTIFIER}/css/:asset`, {
        config: {
            rateLimit: {
                max: 100,
                timeWindow: '15 minutes'
            }
        }
    }, (req, rep) => {
      const reg = /\.css$/.test(req.params.asset);
      if (!reg) {
        return false;
      }
      let asset = basename(req.params.asset);
        let filePath = normalize(join(__dirname, "/templates/assets/css/", asset));
        let basePath = resolve(__dirname, "templates/assets/css");

      if (filePath.indexOf(basePath) !== 0) {
        rep.status(403).send("Forbidden");
      } else {
        const stream = createReadStream(filePath, "utf8");
        rep
            .headers({
                "Content-Type": "text/css",
                "Cache-Control": "public, max-age=" + process.env.ASSETS_CACHE_TTL,
            })
            .send(stream || null);
      }
    })
    .get(`/${process.env.PATH_IDENTIFIER}/fonts/:asset`, {
        config: {
            rateLimit: {
                max: 100,
                timeWindow: '15 minutes'
            }
        }
    }, (req, rep) => {
      const reg = /\.ttf$/.test(req.params.asset);
      if (!reg) {
        return false;
      }
      const stream = createReadStream(
          path.join(__dirname, "/templates/assets/fonts/" + req.params.asset),
          "utf8",
      );
      rep
          .headers({
              "Content-Type": "font/ttf",
              "Cache-Control": "public, max-age=" + process.env.ASSETS_CACHE_TTL,
          })
          .send(stream || null);
    })
    .get(`/${process.env.PATH_IDENTIFIER}/js/:asset`, {
        config: {
            rateLimit: {
                max: 100,
                timeWindow: '15 minutes'
            }
        }
    }, (req, rep) => {
      const reg = /\.js$/.test(req.params.asset);
      if (!reg) {
        return false;
      }
      const stream = createReadStream(
          join(__dirname, "/templates/assets/js/" + req.params.asset),
          "utf8",
      );
      rep
          .headers({
              "Content-Type": "application/javascript",
              "Cache-Control": "public, max-age=" + process.env.ASSETS_CACHE_TTL,
          })
          .send(stream || null);
    })
    .get(`/${process.env.PATH_IDENTIFIER}/lang/lang.json`, {
        config: {
            rateLimit: {
                max: 100,
                timeWindow: '15 minutes'
            }
        }
    }, (req, rep) => {
        const stream = createReadStream(join(__dirname, "/lang/lang.json"));
        rep.headers({
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=" + process.env.ASSETS_CACHE_TTL
        }).send(stream || null);
    })
    .get("/status", {
        config: {
            rateLimit: {
                max: 100,
                timeWindow: '15 minutes'
            }
        }
    }, (req, rep) => {
        rep.send({success: true})
    })


// Start Server
server.listen({host: process.env.SERVER_HOSTNAME, port: process.env.SERVER_PORT}).then(r => {
    server.log.info(`Server connection established`)
})


// Handle SIGTERM Commands

process.on('SIGTERM' || 'SIGINT' || 'SIGKILL', () => {
    server.log.warn("Signal received, shutting down server!")
    server.close(() => {
        process.exit(0);
    })
})


module.exports = {
    server
}
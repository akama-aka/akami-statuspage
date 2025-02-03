'use strict'
const console = require("node:console");
require('dotenv').config()
const {join, basename, normalize, resolve} = require("node:path");
const {createReadStream, path} = require("fs");
const rateLimit = require("@fastify/rate-limit");
// Fastify
const server = require('fastify')({logger: process.env.LOGGING})
    .register(rateLimit, {
        max: 100, // maximum number of requests
        timeWindow: '15 minutes' // time window for the rate limit
    }).register(require('@fastify/static'), {         // For all Static files like Styling, JavaScript Cde
        prefix: `/${process.env.PATH_IDENTIFIER}/assets/`,
        preCompressed: true,
        setHeaders: (res) => {
            cacheControl: `public, max-age=${process.env.ASSETS_CACHE_TTL}`
        },
        root: join(__dirname + '/public/assets/')
    })
    .register(require('@fastify/view'), {           // For all Dynamic files like Statuspages and more
        engine: {
            ejs: require('ejs')
        },
        charset: 'utf-8',
        root: join(__dirname, 'public'),
        //layout: 'layouts/layout.ejs'
    })
    .register(rateLimit)

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
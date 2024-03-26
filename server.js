'use strict'
const fs = require('node:fs');
const path = require("node:path");
module.exports = async function (fastify, opts) {

    await fastify.register(require('@fastify/middie'))
    const path = require('node:path')
    const serveStatic = require('serve-static')

    fastify.use('/css/(.*)', serveStatic(path.join(__dirname, '/css')));
    fastify.use('/js', serveStatic(path.join(__dirname, '/js')));
    fastify.get("/akami-cgi/css/:asset", (request, reply) => {
        let asset = path.basename(request.params.asset);
        let filePath = path.normalize(path.join(__dirname, '/assets/css/', asset));
        let basePath = path.resolve(__dirname, 'assets/css');

        if (filePath.indexOf(basePath) !== 0) {
            // The resolved file path does not reside within the expected directory return an error.
            res.status(403).send('Forbidden');
        } else {
            const stream = fs.createReadStream(filePath, 'utf8');
            reply.header("Content-Type", "text/css").send(stream || null);
        }
    })
    fastify.get("/akami-cgi/js/:asset", (request, reply) => {
        const stream = fs.createReadStream(path.join(__dirname, '/assets/js/'+request.params.asset), 'utf8');
        reply.header("Content-Type", "application/javascript").send(stream || null);
    })
    fastify.get("/akami-cgi/:code", (request, reply) => {
        let fn;
        switch (request.params.code) {
            case "404":
                fn = "pageNotFound.html";
                break;
            case "500":
                fn = "internalServerError.html"
                break;
            case "502":
                fn = "badGateway.html"
                break;
            case "503":
                fn = "serviceUnavailable.html";
                break;
            case "504":
                fn = "gatewayTimeout.html"
                break;
            case "1000":
                fn = "directAccessForbidden.html"
                break;
            case "1001":
                fn = "noDatabaseConnection.html";
                break;
            default:
                fn = null;
        }
        fs.readFile(path.join(__dirname, `/html/${fn}`), 'utf-8', (err, data) => {
            if(err) {
                console.error(err);
            }
            const res = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            const result = res.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        });
    })
}
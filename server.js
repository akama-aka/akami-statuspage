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
        let asset = path.basename(req.params.asset);
        let filePath = path.normalize(path.join(__dirname, '/assets/css/', asset));
        let basePath = path.resolve(__dirname, 'assets/css');

        if (filePath.indexOf(basePath) !== 0) {
            // The resolved file path does not reside within the expected directory return an error.
            res.status(403).send('Forbidden');
        } else {
            const stream = fs.createReadStream(filePath, 'utf8');
            reply.header("Content-Type", "text/css").send(stream || null);

            // ... weiter mit den Datei-Streaming-Code
        }
    })
    fastify.get("/akami-cgi/js/:asset", (request, reply) => {
        const stream = fs.createReadStream(path.join(__dirname, '/assets/js/'+request.params.asset), 'utf8');
        reply.header("Content-Type", "application/javascript").send(stream || null);
    })
    fastify.get("/akami-cgi/404", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/pageNotFound.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
    fastify.get("/akami-cgi/502", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/badGateway.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
    fastify.get("/akami-cgi/1000", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/directAccessForbidden.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
    fastify.get("/akami-cgi/504", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/gatewayTimeout.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
    fastify.get("/akami-cgi/500", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/internalServerError.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
    fastify.get("/akami-cgi/1001", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/noDatabaseConnection.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
    fastify.get("/akami-cgi/503", (request, reply) => {
        const stream = fs.readFile(path.join(__dirname, '/html/serviceUnavailable.html'), 'utf8', function (err, data)  {
            if(err) {
                return console.log(err);
            }
            var result = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            var result = result.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.header("Content-Type", "text/html").send(result);
        })
    })
}
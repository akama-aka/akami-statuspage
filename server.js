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
            case "1002":
                fn = "sslError.html";
                break;
            default:
                fn = "pageNotFound.html";
        }
        fs.readFile(path.join(__dirname, `/html/${fn}`), 'utf-8', (err, data) => {
            if(err) {
                console.error(err);
            }
            // Inject the CloudFlare Ray ID
            let res = data.replace("__implement-ray-id__", request.headers["cf-ray"] || request.id);
            // Inject the JavaScript Sources at the bottom of the Body
            res = res.replace('__implement_body_script__', '<!--Implement Body Scripts--><script src="/akami-cgi/js/bootstrap.bundle.min.js"></script>');
            // Inject the Styling
            res = res.replace('__implement_style__', '<!--Implemented Styling--><link rel="stylesheet" href="/akami-cgi/css/bootstrap.min.css">' +
                '    <link rel="stylesheet" href="/akami-cgi/css/style.css">')

            // Inject the Client IP
            const result = res.replace("__implement-ip__", request.headers["cf-ip"] || request.ip);
            reply.headers({
                "Content-Type": "text/html",
                "Server": "Akami Solutions",
                "X-Powered-By": "A DNS System by Akami Solutions"
            }).send(result);
        });
    })
}

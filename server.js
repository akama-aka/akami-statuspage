'use strict'
const {createReadStream,readFile} = require('node:fs');
const {join,basename,normalize,resolve } = require("node:path");
const {getCache, setCache} = require("./middleware/redis-connector");
require('dotenv').config();
let defaultHeader = {
    "Server": "Akami Solutions",
    "X-Powered-By": "A DNS System by Akami Solutions",
    "Cache-Control": "private, max-age=2592000"
}
module.exports = async function (fastify, opts) {
    let path_name = process.env.PATH_IDENTIFIER;
    await fastify.register(require('@fastify/middie'))
    const path = require('node:path')
    const serveStatic = require('serve-static')

    fastify.use(['/css/*name{.css}', '/js/*name{.js}', '/fonts/*name{.tff}'], serveStatic(path.join(__dirname+'/assets')))
    fastify.get(`/${path_name}/css/:asset`, (req, rep) => {
        const reg = /\.css$/.test(req.params.asset)
        if (!reg) {
            return false;
        }
        let asset = basename(req.params.asset);
        let filePath = normalize(join(__dirname, '/assets/css/', asset));
        let basePath = resolve(__dirname, 'assets/css');

        if (filePath.indexOf(basePath) !== 0) {
            rep.status(403).send('Forbidden');
        } else {
            const stream = createReadStream(filePath, 'utf8');
            rep.headers({
                "Content-Type": "text/css",
                "Cache-Control": "public, max-age="+process.env.ASSETS_CACHE_TTL
            }).send(stream || null);
        }
    })
    fastify.get(`/${path_name}/fonts/:asset`, (req, rep) => {
        const reg = /\.ttf$/.test(req.params.asset)
        if (!reg) {
            return false;
        }
        const stream = createReadStream(path.join(__dirname, '/assets/fonts/'+req.params.asset), 'utf8');
        rep.headers({
            "Content-Type": "font/ttf",
            "Cache-Control": "public, max-age="+process.env.ASSETS_CACHE_TTL
        }).send(stream || null);
    })
    fastify.get(`/${path_name}/js/:asset`, (req, rep) => {
        const reg = /\.js$/.test(req.params.asset)
        if (!reg) {
            return false;
        }
        const stream = createReadStream(join(__dirname, '/assets/js/'+req.params.asset), 'utf8');
        rep.headers({
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age="+process.env.ASSETS_CACHE_TTL
        }).send(stream || null);
    })
    fastify.get(`/${path_name}/status/:code`, (req, rep) => {
        let fn;
        let req_id = req.headers["cf-ray"] || req.headers["cdn-requestid"] || req.headers["X-Amz-Cf-Id"] || req.headers["akamai-x-get-request-id"] || req.headers["x-appengine-request-log-id"] || req.headers["requestId"] || req.headers["opc-request-id"] || req.id;
        let req_ip = req.headers["Cf-Connecting-Ip"] || req.headers["cf-connecting-ipv6"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip;
        switch (req.params.code) {
            case "403":
                fn = "accessForbidden.html";
                break;
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
        readFile(join(__dirname, `/html/${fn}`), 'utf-8', (err, data) => {
            if(err) {
                console.error(err);
            }
            // Inject the CloudFlare Ray ID
            let res = data.replace("__implement-ray-id__", req_id);
            // Inject the JavaScript Sources at the bottom of the Body
            res = res.replace('__implement_body_script__', '<!--Implement Body Scripts--><script src="/'+path_name+'/js/bootstrap.bundle.min.js"></script>');
            // Inject the Styling
            res = res.replace('__implement_style__', '<!--Implemented Styling--><link rel="stylesheet" href="/'+path_name+'/css/bootstrap.min.css">' +
                '    <link rel="stylesheet" href="/'+path_name+'/css/style.css">')

            // Inject the Client IP
            const result = res.replace("__implement-ip__", req_ip);
            rep.headers(defaultHeader).send(result);
        });
    })
    fastify.get(`/${path_name}/xray`, async (req, rep) => {
        // Resolve the IP Country
        const options = {method: 'GET', headers: {'User-Agent': 'insomnia/8.3.0'}};
        let req_id = req.headers["cf-ray"] || req.headers["cdn-requestid"] || req.headers["X-Amz-Cf-Id"] || req.headers["akamai-x-get-request-id"] || req.headers["x-appengine-request-log-id"] || req.headers["requestId"] || req.headers["opc-request-id"] || req.id;
        let req_ip = req.headers["Cf-Connecting-Ip"] || req.headers["cf-connecting-ipv6"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip;
        let ttl = process.env.IP_DATA_CACHE_TTL; // 3 Month
        let val = await getCache(req_ip);
        const rayResponse = function (response) {
            return `Host=${req.headers[":authority"] || req.headers["host"]}\nrequest=${req_id}\nip=${req_ip}\ncountry=${response["data"]["located_resources"][0]["locations"][0]["country"]} # IP resolution by RIPE DB & MaxMind`
        }
        const rayResponseLocal = `Host=${req.headers["host"]}\nRequest ID: ${req_id}\nIP: ${req_ip}\nCountry: Local IP`;
        if (!val) {
            return await fetch('https://stat.ripe.net/data/maxmind-geo-lite/data.json?resource=' + req_ip, options)
                .then(response => response.json())
                .then(response => {
                    if (response && response["data"]["located_resources"].length > 0) {
                        return setCache(req_ip, response, ttl).then((r) => {
                            if (r.error) {
                                fastify.log.error(r.error);
                                return rep.headers("Content-Type", "text/plain").code(500).send("Internal Server Error");
                            }
                            return rep.headers("Content-Type", "text/plain").code(200).send(rayResponse(response))
                        }).catch((err) => {
                            fastify.log.error(err);
                            return rep.headers("Content-Type", "text/plain").code(500).send("Internal Server Error");
                        });
                    } else {
                        return setCache(req_ip, response, ttl).then((r) => {
                            if (r.error) {
                                fastify.log.error(r.error);
                            }
                            return rep.headers("Content-Type", "text/plain").code(200).send(rayResponseLocal);
                        }).catch((err) => {
                            fastify.log.error(err);
                            return rep.headers("Content-Type", "text/plain").code(500).send("Internal Server Error");
                        });
                    }
                }).catch(err => fastify.log.error(err));
        } else {
            const response = await JSON.parse(val);
            if (response && response["data"]["located_resources"].length > 0) {
                return rep.headers("Content-Type", "text/plain").code(200).send(rayResponse(response));
            } else {
                return rep.headers("Content-Type", "text/plain").code(200).send(rayResponseLocal);
            }
        }
    })
}

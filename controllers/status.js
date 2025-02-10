'use strict'

const {readFile} = require("node:fs");
const {join} = require("node:path");
const status = require('../lang/lang.json')
const {getId, getIp} = require("../middleware/paramSetter");
const {server} = require("../server");
const {checkCDN} = require("../middleware/cdnChecker");
/**
 * @copyright by Akama Aka <akama.aka@kitsune.exposed> | Aki Solutions
 * @license ASPL 1.0 <https://licenses.aki-solutions.net>
 * @type {[{handler: *, method: string, url: string}]}
 */
module.exports = [
    {
        method: 'GET',
        url: `/${process.env.PATH_IDENTIFIER}/status/:statusCode`,
        handler: (req, rep) => {

            let lang = req.headers["accept-language"]?.split(",")[0] ?? "en-en";
            let cdn = checkCDN(req.headers);

            if (status[lang.toLowerCase()] === undefined || status[lang.toLowerCase()]["client"] === undefined) {
                lang = "en-en";
            }
            lang = lang.toLowerCase();
            const currentStatusCode = req.statusCode ?? req.params.statusCode ?? "404";
            return rep.headers({
                "Content-Type": "text/html",
                "Retry-After": "300",
                "X-Robots-Tag": "noindex,nofollow",
                "X-Frame-Options": "SAMEORIGIN",
                "X-Content-Type-Options": "nosniff",
                "X-XSS-Protection": "1; mode=block",
                "Cache-Control": "no-store",
                "Content-Security-Policy": "default-src 'self' 'aki-solutions.net'; script-src 'self' 'aki-solutions.net' 'unsafe-hashes' 'sha256-VtZgjCPNzQgWUaxUGt2RNVF2XDE4SiiHoSzVWKu2oDo='; script-src-elem 'self' 'unsafe-hashes' 'sha256-QqqR1KmqVKrfiXsygsTUa+VstTb+W7ZaVzGRbJF4OLw=' 'sha256-VtZgjCPNzQgWUaxUGt2RNVF2XDE4SiiHoSzVWKu2oDo='; script-src-attr 'self' 'unsafe-hashes' 'sha256-VtZgjCPNzQgWUaxUGt2RNVF2XDE4SiiHoSzVWKu2oDo=' style-src 'self' 'https://aki-solutions.net'; style-src-elem 'self' 'aki-solutions.net'; style-src-attr 'self' 'unsafe-hashes' 'sha256-q3nqK4VzeI/SowYCYQ/tCfo056B/JMutuSpzbJbHczk=' 'sha256-EyIkcmB0sGGmsC3z7YbHN2sjpfbxZ8bVPQSsLf3EVWw=' 'sha256-GPI0AvwLxP9frcpYjtU59LpAaMAJfP/lwxArGKRa0f4=' 'sha256-NJpPoxqyRfVnPZ7BBUyaote/6HW12xZPDGLIv2SoiOA=' 'sha256-Sa4qnAYe3JDEveYr7kHEi3Fx0dq1/BUSeTM+zER/0BM=' 'sha256-Sa4qnAYe3JDEveYr7kHEi3Fx0dq1/BUSeTM+zER/0BM=' 'sha256-N08pmMrIK3VqvN8MEzniXYzLvVxsp1nOHSWu6L69YqM=' 'sha256-GPI0AvwLxP9frcpYjtU59LpAaMAJfP/lwxArGKRa0f4=' 'sha256-NJpPoxqyRfVnPZ7BBUyaote/6HW12xZPDGLIv2SoiOA=' 'sha256-Sa4qnAYe3JDEveYr7kHEi3Fx0dq1/BUSeTM+zER/0BM=' 'sha256-N08pmMrIK3VqvN8MEzniXYzLvVxsp1nOHSWu6L69YqM=' 'aki-solutions.net'; img-src 'self' https://aki-solutions.net; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'self'; prefetch-src 'self'; child-src 'self'; frame-src 'self'; worker-src 'self'; frame-ancestors 'self'; form-action 'self'; block-all-mixed-content; manifest-src 'self'",
                "Access-Control-Allow-Credentials": false,
                "Access-Control-Allow-Methods": "GET",
                "Allow": "GET",
                "Cross-Origin-Embedder-Policy": "credentialless",
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Resource-Policy": "same-origin"
            }).view('response', {
                title: status[lang][currentStatusCode]?.["title"] ?? status["en-en"][currentStatusCode]?.["title"] ?? "",
                headStyle: ``,
                statusCode: req.statusCode ?? req.params.statusCode ?? "404",
                statusMessage: status[lang]?.[currentStatusCode]?.["title"] ?? status["en-en"]?.[currentStatusCode]?.["title"] ?? "",
                clientText: status[lang]?.["client"] ?? status["en-en"]?.["client"],
                cdnName: cdn.name,
                proxyName: process.env.PATH_IDENTIFIER ?? "Unknown",
                gatewayName: status[lang]?.["gateway"] ?? status["en-en"]?.["gateway"],
                cdnLogo: cdn.icon,
                w1Header: status[lang]?.["subtitle1"] ?? status["en-en"]?.["subtitle1"],
                w1: status[lang]?.[currentStatusCode]?.["text1"] ?? status["en-en"]?.[currentStatusCode]?.["text1"] ?? "",
                w2Header: status[lang]["subtitle2"] ?? status["en-en"]["subtitle2"],
                w2: status[lang]?.[currentStatusCode]?.["text2"] ?? status["en-en"]?.[currentStatusCode]?.["text2"] ?? "",
                reqIdText: status[lang]?.["requestId"] ?? status["en-en"]?.["requestId"],
                reqId: getId(req.headers) ?? req.id,
                reqIpText: status[lang]?.["ipAddress"] ?? status["en-en"]?.["ipAddress"],
                reqIp: getIp(req.headers) ?? req.ip,
            })
        }
    }
]
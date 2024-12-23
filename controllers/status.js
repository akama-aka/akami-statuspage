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
            readFile(join(__dirname, `/../templates/index.html`), 'utf8', (err, data) => {
                if (err) {
                    server.log.error(err)
                    return rep.code(500).send({message: "Critical Internal Server Error while reading index.html file"});
                }
                const currentStatusCode = req.statusCode ?? req.params.statusCode ?? "404";
                let res = data.replace("__implement-style__", '<!--Implemented Styling--><link rel="stylesheet" href="/' + process.env.PATH_IDENTIFIER + '/css/bootstrap.min.css">' + '    <link rel="stylesheet" href="/' + process.env.PATH_IDENTIFIER + '/css/style.css">');
                res = res = res.replace("__implement-title__", status[lang][currentStatusCode]?.["title"] ?? status["en-en"][currentStatusCode]?.["title"] ?? "");
                res = res = res.replace("__implement-status-code__", req.statusCode ?? req.params.statusCode ?? 404);
                res = res.replace("__implement-status-message__", status[lang]?.[currentStatusCode]?.["title"] ?? status["en-en"]?.[currentStatusCode]?.["title"] ?? "");
                res = res.replace("__implement-client__", status[lang]?.["client"] ?? status["en-en"]?.["client"]);
                res = res.replace("__implement-gateway__", status[lang]?.["gateway"] ?? status["en-en"]?.["gateway"]);
                res = res.replace("__implement-cdn-logo__", cdn.icon);
                res = res.replaceAll("__implement-cdn-name__", cdn.name);
                if (!process.env.PROXY_NAME) {
                    res = res.replace("__implement-hide-proxy__", "hide-proxy");
                } else {
                    res = res.replace("__implement-proxy-name__", process.env.PROXY_NAME ?? "Unknown");
                }
                res = res.replace("__implement-w1-header__", status[lang]?.["subtitle1"] ?? status["en-en"]?.["subtitle1"]);
                res = res.replace("__implement-w1__", status[lang]?.[currentStatusCode]?.["text1"] ?? status["en-en"]?.[currentStatusCode]?.["text1"] ?? "")
                res = res.replace("__implement-w2-header__", status[lang]["subtitle2"] ?? status["en-en"]["subtitle2"]);
                res = res.replace("__implement-w2__", status[lang]?.[currentStatusCode]?.["text2"] ?? status["en-en"]?.[currentStatusCode]?.["text2"] ?? "")
                res = res.replace("__implement-req-id-message__", status[lang]?.["requestId"] ?? status["en-en"]?.["requestId"]);
                res = res.replace("__implement-ray-id__", getId(req.headers) ?? req.id);
                res = res.replace("__implement-ip-message__", status[lang]?.["ipAddress"] ?? status["en-en"]?.["ipAddress"]);
                res = res.replace("__implement-ip__", getIp(req.headers) ?? req.ip);
                res = res.replace("__implement_body_script__", '<!--Implement Body Scripts--><script src="/' + process.env.PATH_IDENTIFIER + '/js/script.js"></script><script src="/' + process.env.PATH_IDENTIFIER + '/js/bootstrap.bundle.min.js"></script>',)
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
                }).send(res);
            })
        }
    }
]
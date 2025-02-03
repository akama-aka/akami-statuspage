'use strict'

const {getIp, getId} = require("../middleware/paramSetter");
const {getCache, setCache} = require("../middleware/redisConnector");
const process = require("node:process");
/**
 * @copyright by Akama Aka <akama.aka@kitsune.exposed> | Aki Solutions
 * @license ASPL 1.0 <https://licenses.aki-solutions.net>
 * @type {[{handler: ((function(*, *): Promise<*|undefined>)|*), method: string, url: string}]}
 */
module.exports = [
    {
        method: 'GET',
        url: `/${process.env.PATH_IDENTIFIER}/xray`,
        handler: async function (req, res) {
            console.debug(req.ip)
            const ip = getIp(req.headers) ?? "213.142.96.192" ?? req.ip;
            const id = getId(req.headers) ?? req.id;
            const fetchHeaders = {method: 'GET', headers: {'User-Agent': `cdn-server_${process.env.PATH_IDENTIFIER}`}}
            const ipCacheTTL = process.env.IP_CACHE_TTL;
            const cacheVal = await getCache(ip)
            const rayResponseLocal = `Host=${req.headers["host"]}\nRequest ID: ${id}\nIP: ${ip}\nCountry: Local IP`;
            const responseSchema = async function (response) {
                return `Host=${req.hostname}\nTimestamp=${Date.now()}\nUserAgent=${req.headers["user-agent"]}\nHttp=${req.protocol}\nRequestId=${id}\nIp=${ip}\nCountry=${response["data"]["located_resources"][0]["locations"][0]["country"] || null}`;
            }
            // Check if IP is local to reduce traffic
            const ipv4RegEx = /^(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3})$/;
            const ipv6RegEx = /^(::1|fc[0-9a-fA-F]{2}:[0-9a-fA-F]{0,4}:{0,6}|fe[89ab][0-9a-fA-F]{0,4}:{0,6})$/;
            if (ipv4RegEx.test(ip) || ipv6RegEx.test(ip)) {
                return res
                    .headers("Content-Type", "text/plain")
                    .code(200)
                    .send(rayResponseLocal);
            }
            if (!cacheVal) {
                return await fetch(`https://stat.ripe.net/data/maxmind-geo-lite/data.json?resource=${ip}`, fetchHeaders)
                    .then(response => response.json())
                    .then(async response => {
                        return setCache(ip, response, ipCacheTTL).then(async (r) => {
                            return await res.headers('Content-Type', 'text/plain').code(200).send(await responseSchema(response))
                        });
                    })
            } else {
                const response = JSON.parse(await cacheVal);
                await res.send(await responseSchema(response));
            }
        }
    }
]
const Redis = require('ioredis');
const crypto = require("node:crypto");

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379
});

/**
 * @see https://medium.com/@hamzamakh/how-to-optimize-node-js-app-with-api-caching-using-redis-4bda7961009
 * @desc Add redis data with cache ttl
 * @param key : string
 * @param value : string
 * @param ttl : number
 * @returns {Promise<ResultTypes<"OK", Context>[Context["type"]]>}
 */
async function setCache(key, value, ttl = 3600) {
    return redisClient.set(key, JSON.stringify(value), 'EX', ttl);
}

/**
 * @see https://medium.com/@hamzamakh/how-to-optimize-node-js-app-with-api-caching-using-redis-4bda7961009
 * @desc Get redis data by key
 * @param key : string
 * @returns {Promise<ResultTypes<string, Context>[Context["type"]]>}
 */
async function getCache(key) {
    return redisClient.get(key);
}

/**
 * @desc Generate Cache Key ID with User-Agent and the Users IP
 * @param ip : string
 * @param useragent :string
 * @returns {Promise<ArrayBuffer>}
 */
async function createCacheKey(ip, useragent,) {
    return crypto.createHash('md5').update(ip + useragent).digest('hex');
}

module.exports = {
    getCache,
    setCache,
    createCacheKey
}
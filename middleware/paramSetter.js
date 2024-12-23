module.exports = {
    /**
     * @desc Gets the IP Address of the Connecting Client
     * @param headers
     * @returns {*|string}
     */
    getIp: function (headers) {
        return headers["Cf-Connecting-Ip"] || headers["cf-connecting-ipv6"] || headers["x-real-ip"] || headers["x-forwarded-for"] || headers.ip;
    },
    /**
     * @desc Gets the ID of the Connecting Client
     * @param headers
     * @returns {*|string}
     */
    getId: function (headers) {
        return headers["cf-ray"] || headers["cdn-requestid"] || headers["X-Amz-Cf-Id"] || headers["akamai-x-get-request-id"] || headers["x-appengine-request-log-id"] || headers["requestId"] || headers["opc-request-id"] || headers.id;
    }
}
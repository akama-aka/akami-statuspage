'use strict'

/**
 * @desc Checks the connection if a request was already made
 * @param headers
 * @returns {{name: null, icon: null}}
 */
function checkCDN(headers) {
    let cdnData = {name: null, icon: null};
    headers["server"] = headers["server"]?.toLowerCase() || headers["via"]?.toLowerCase();

    if ((headers["server"] && headers["server"].startsWith("cloudflare")) || (headers["via"] && headers["via"].startsWith("cloudflare"))) {
        cdnData.name = "CloudFlare";
        cdnData.icon = "cloudflare";
        return cdnData;
    } else if ((headers["server"] && headers["server"].startsWith("bunnycdn")) || (headers["via"] && headers["via"].startsWith("bunnycdn"))) {
        cdnData.name = "BunnyCDN";
        cdnData.icon = "carrot";
        return cdnData;
    } else {
        cdnData.name = "Unknown";
        cdnData.icon = "circleNodes";
        return cdnData;
    }
}

module.exports = {
    checkCDN: checkCDN,
}
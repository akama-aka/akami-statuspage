let ip;
if (navigator.doNotTrack) {
    console.debug(document.getElementById("hide-ip?").textContent)
    ip = document.getElementById("hide-ip?").textContent;
    document.getElementById("hide-ip?").innerHTML = "[Redacted]";
    document.getElementById("hide-ip?").style.visibility = "visible";
} else {
    document.getElementById("hide-ip?").style.visibility = "visible";
}

function showIp() {
    console.debug(ip);
    document.getElementById("hide-ip?").innerText = ip.toString();
}
.pragma library

function loadJson(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE
            && (xhr.status === 200
                || xhr.status === 0))
            callback(JSON.parse(
                xhr.responseText));
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function httpRequest(baseUrl, method, endpoint,
                     body, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState
            === XMLHttpRequest.DONE) {
            if (xhr.status >= 200
                && xhr.status < 300) {
                try {
                    var result = JSON.parse(
                        xhr.responseText);
                    if (callback)
                        callback(result, null);
                } catch (e) {
                    if (callback)
                        callback(null,
                            "Parse error: "
                            + e.message);
                }
            } else {
                if (callback)
                    callback(null,
                        xhr.statusText
                        || "Request failed ("
                        + xhr.status + ")");
            }
        }
    };
    xhr.open(method, baseUrl + endpoint);
    xhr.setRequestHeader(
        "Content-Type", "application/json");
    if (body) xhr.send(JSON.stringify(body));
    else xhr.send();
}

function prependJob(jobs, result, type) {
    var updated = jobs.slice();
    updated.unshift({
        id: result.id
            || ("job-" + (jobs.length + 1)
                .toString().padStart(3, "0")),
        type: type,
        status: "queued",
        progress: 0,
        created: Qt.formatDateTime(
            new Date(), "yyyy-MM-dd hh:mm:ss")
    });
    return updated;
}

function cancelJob(jobs, jobId) {
    return jobs.map(function(j) {
        return j.id === jobId
            ? Object.assign({}, j, {
                status: "failed",
                progress: j.progress
            })
            : j;
    });
}

function toggleRadio(radioChannels, index) {
    var updated = radioChannels.slice();
    var ch = Object.assign({}, updated[index]);
    if (ch.status === "live") {
        ch.status = "offline";
        ch.listeners = 0;
        ch.currentTrack = "---";
    } else {
        ch.status = "live";
        ch.listeners =
            Math.floor(Math.random() * 200)
            + 10;
        ch.currentTrack = ch.playlist[0];
    }
    updated[index] = ch;
    return updated;
}

function toggleTv(tvChannels, index) {
    var updated = tvChannels.slice();
    var ch = Object.assign({}, updated[index]);
    if (ch.status === "broadcasting") {
        ch.status = "offline";
        ch.viewers = 0;
        ch.uptime = "0m";
    } else {
        ch.status = "broadcasting";
        ch.viewers =
            Math.floor(Math.random() * 500)
            + 20;
        ch.uptime = "0m";
    }
    updated[index] = ch;
    return updated;
}

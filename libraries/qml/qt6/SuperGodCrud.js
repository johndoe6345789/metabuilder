.pragma library

function loadJsonSync(path) {
    var xhr = new XMLHttpRequest();
    try {
        xhr.open("GET", Qt.resolvedUrl(path), false);
        xhr.send();
        if (xhr.status === 200 || xhr.status === 0)
            return JSON.parse(xhr.responseText);
    } catch(e) {}
    return null;
}

function filterGodUsers(items) {
    var gods = [];
    for (var i = 0; i < items.length; i++) {
        var u = items[i];
        if (u.role === "god" || u.role === "supergod") gods.push(u);
    }
    return gods;
}

function processTransferAction(pendingTransfers, transferHistory, index,
    status) {
    var entry = {
        from: pendingTransfers[index].from,
        to: pendingTransfers[index].to,
        reason: pendingTransfers[index].reason,
        date: "2026-03-18 " + Qt.formatTime(new Date(), "hh:mm"),
        status: status
    };
    var hist = transferHistory.slice();
    hist.unshift(entry);
    var pend = pendingTransfers.slice();
    pend.splice(index, 1);
    return { pending: pend, history: hist };
}

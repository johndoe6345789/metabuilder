// DatabaseLogic.js — DBAL + utility logic for
// DatabaseManager

function formatSize(kb) {
    return kb < 1024
        ? kb + " KB"
        : (kb / 1024).toFixed(1) + " MB"
}

function totalRecords(backends) {
    var s = 0
    for (var i = 0; i < backends.length; i++)
        s += backends[i].records
    return s
}

function totalSize(backends) {
    var s = 0
    for (var i = 0; i < backends.length; i++)
        s += backends[i].sizeKb
    return s
}

function connectedCount(backends) {
    var c = 0
    for (var i = 0; i < backends.length; i++)
        if (backends[i].status === "connected") c++
    return c
}

function testConnectionLive(root, dbal,
                            testTimer, index) {
    root.testingIndex = index
    if (root.useLiveData) {
        dbal.execute("core/test-connection",
            { adapter: root.backends[index].key },
            function(result, error) {
            var newResults = Object.assign(
                {}, root.testResults)
            newResults[index] =
                (!error && result && result.success)
                    ? "success" : "error"
            root.testResults = newResults
            root.testingIndex = -1
        })
    } else {
        testTimer.targetIndex = index
        testTimer.start()
    }
}

function loadAdapterStatus(root, dbal) {
    dbal.execute("core/adapters", {},
        function(result, error) {
        if (!error && result && result.adapters
            && result.adapters.length > 0) {
            var liveBackends = []
            for (var i = 0;
                 i < result.adapters.length; i++) {
                var a = result.adapters[i]
                liveBackends.push({
                    name: a.name || "",
                    key: a.key || "",
                    status: a.status
                        || "disconnected",
                    description:
                        a.description || "",
                    connectionString:
                        a.connectionString || "",
                    records: a.records || 0,
                    sizeKb: a.sizeKb || 0,
                    lastBackup:
                        a.lastBackup || "Never"
                })
            }
            root.backends = liveBackends
            if (root.selectedBackendIndex
                >= liveBackends.length)
                root.selectedBackendIndex = 0
            if (root.activeBackendIndex
                >= liveBackends.length)
                root.activeBackendIndex = 0
        }
    })
}

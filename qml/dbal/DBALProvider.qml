import QtQuick

/**
 * QML DBAL Client Component
 * 
 * Provides database operations for QML UI components.
 * Wraps the C++ DBALClient for easy QML integration.
 * 
 * Example:
 * ```qml
 * import "../qmllib/dbal"
 * 
 * DBALProvider {
 *     id: dbal
 *     baseUrl: "http://localhost:3001/api/dbal"
 *     tenantId: "default"
 *     
 *     onConnectedChanged: {
 *         if (connected) {
 *             loadUsers()
 *         }
 *     }
 * }
 * 
 * function loadUsers() {
 *     dbal.list("User", { take: 20 }, function(result) {
 *         userModel.clear()
 *         for (var i = 0; i < result.items.length; i++) {
 *             userModel.append(result.items[i])
 *         }
 *     })
 * }
 * ```
 */
Item {
    id: root
    
    // Configuration — DBAL REST: /api/v1/{tenant}/{package}/{entity}[/{id}]
    property string baseUrl: "http://localhost:8080"
    property string tenantId: "default"
    property string packageId: "core"
    property string authToken: ""
    
    // State
    property bool connected: false
    property bool loading: false
    property string lastError: ""
    
    // Signals
    signal errorOccurred(string message)
    signal operationCompleted(string operation, var result)
    
    // Internal HTTP client (simplified - would use XMLHttpRequest in real impl)
    QtObject {
        id: internal
        
        function request(method, endpoint, body, callback) {
            root.loading = true
            root.lastError = ""
            
            var xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    root.loading = false
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var result = JSON.parse(xhr.responseText)
                            if (callback) callback(result, null)
                            root.operationCompleted(endpoint, result)
                        } catch (e) {
                            var err = "Failed to parse response: " + e.message
                            root.lastError = err
                            root.errorOccurred(err)
                            if (callback) callback(null, err)
                        }
                    } else {
                        var error = xhr.statusText || "Request failed"
                        root.lastError = error
                        root.errorOccurred(error)
                        if (callback) callback(null, error)
                    }
                }
            }
            
            var url = root.baseUrl + endpoint
            xhr.open(method, url)
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.setRequestHeader("X-Tenant-ID", root.tenantId)
            
            if (root.authToken) {
                xhr.setRequestHeader("Authorization",
                    "Bearer " + root.authToken)
            }
            
            if (body) {
                xhr.send(JSON.stringify(body))
            } else {
                xhr.send()
            }
        }
    }
    
    // REST path helpers
    function entityPath(entity) {
        return "/api/v1/" + tenantId + "/" + packageId + "/" +
            entity.toLowerCase()
    }

    function entityPathWithId(entity, id) {
        return entityPath(entity) + "/" + id
    }

    // Public API — DBAL REST: /api/v1/{tenant}/{package}/{entity}[/{id}]

    function create(entity, data, callback) {
        internal.request("POST", entityPath(entity), data, callback)
    }

    function read(entity, id, callback) {
        internal.request("GET", entityPathWithId(entity, id), null, callback)
    }

    function update(entity, id, data, callback) {
        internal.request("PUT", entityPathWithId(entity, id), data, callback)
    }

    function remove(entity, id, callback) {
        internal.request("DELETE", entityPathWithId(entity, id), null, callback)
    }

    function list(entity, options, callback) {
        var path = entityPath(entity)
        var queryParts = []
        if (options.take !== undefined) queryParts.push("take=" + options.take)
        if (options.skip !== undefined) queryParts.push("skip=" + options.skip)
        if (options.orderBy !== undefined) queryParts.push("orderBy=" +
            options.orderBy)
        if (queryParts.length > 0) path += "?" + queryParts.join("&")

        internal.request("GET", path, null, callback)
    }

    function findFirst(entity, filter, callback) {
        var path = entityPath(entity) + "?take=1"
        for (var key in filter) {
            path += "&" + encodeURIComponent(
                key) + "=" + encodeURIComponent(filter[key])
        }
        internal.request("GET", path, null, callback)
    }

    function execute(operation, params, callback) {
        var path = "/api/v1/" + tenantId + "/" + operation
        internal.request("POST", path, params, callback)
    }

    function ping(callback) {
        internal.request("GET", "/health", null, function(result, error) {
            root.connected = !error
            if (callback) callback(!error, error)
        })
    }
    
    // Auto-ping on component ready
    Component.onCompleted: {
        ping()
    }
}

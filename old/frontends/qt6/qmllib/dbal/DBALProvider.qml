import QtQuick
import QtQuick.Controls.Material

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
    
    // Configuration
    property string baseUrl: "http://localhost:3001/api/dbal"
    property string tenantId: "default"
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
                xhr.setRequestHeader("Authorization", "Bearer " + root.authToken)
            }
            
            if (body) {
                xhr.send(JSON.stringify(body))
            } else {
                xhr.send()
            }
        }
    }
    
    // Public API
    
    /**
     * Create a new record
     * @param {string} entity - Entity name (e.g., "User", "AuditLog")
     * @param {object} data - Record data
     * @param {function} callback - Callback(result, error)
     */
    function create(entity, data, callback) {
        internal.request("POST", "/create", {
            entity: entity,
            data: data,
            tenantId: tenantId
        }, callback)
    }
    
    /**
     * Read a single record by ID
     * @param {string} entity - Entity name
     * @param {string} id - Record ID
     * @param {function} callback - Callback(result, error)
     */
    function read(entity, id, callback) {
        internal.request("GET", "/read/" + entity + "/" + id, null, callback)
    }
    
    /**
     * Update an existing record
     * @param {string} entity - Entity name
     * @param {string} id - Record ID
     * @param {object} data - Updated fields
     * @param {function} callback - Callback(result, error)
     */
    function update(entity, id, data, callback) {
        internal.request("PUT", "/update", {
            entity: entity,
            id: id,
            data: data
        }, callback)
    }
    
    /**
     * Delete a record
     * @param {string} entity - Entity name
     * @param {string} id - Record ID
     * @param {function} callback - Callback(success, error)
     */
    function remove(entity, id, callback) {
        internal.request("DELETE", "/delete/" + entity + "/" + id, null, callback)
    }
    
    /**
     * List records with pagination and filtering
     * @param {string} entity - Entity name
     * @param {object} options - { take, skip, where, orderBy }
     * @param {function} callback - Callback({ items, total }, error)
     */
    function list(entity, options, callback) {
        var body = {
            entity: entity,
            tenantId: tenantId
        }
        
        if (options.take !== undefined) body.take = options.take
        if (options.skip !== undefined) body.skip = options.skip
        if (options.where !== undefined) body.where = options.where
        if (options.orderBy !== undefined) body.orderBy = options.orderBy
        
        internal.request("POST", "/list", body, callback)
    }
    
    /**
     * Find first record matching filter
     * @param {string} entity - Entity name
     * @param {object} filter - Filter criteria
     * @param {function} callback - Callback(result, error)
     */
    function findFirst(entity, filter, callback) {
        internal.request("POST", "/findFirst", {
            entity: entity,
            tenantId: tenantId,
            filter: filter
        }, callback)
    }
    
    /**
     * Execute a named operation
     * @param {string} operation - Operation name
     * @param {object} params - Operation parameters
     * @param {function} callback - Callback(result, error)
     */
    function execute(operation, params, callback) {
        internal.request("POST", "/execute", {
            operation: operation,
            params: params,
            tenantId: tenantId
        }, callback)
    }
    
    /**
     * Check connection to DBAL backend
     * @param {function} callback - Callback(success, error)
     */
    function ping(callback) {
        internal.request("GET", "/ping", null, function(result, error) {
            root.connected = !error
            if (callback) callback(!error, error)
        })
    }
    
    // Auto-ping on component ready
    Component.onCompleted: {
        ping()
    }
}

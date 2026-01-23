pragma Singleton
import QtQuick

/**
 * AjaxQueueContext - Global AJAX request tracking
 * Mirrors React's AjaxQueueContext.jsx
 */
QtObject {
    id: ajaxQueue
    
    // Request queue
    property var queue: []
    
    // Statistics
    property int pending: 0
    property int completed: 0
    property int failed: 0
    
    // Visibility
    property bool isVisible: false
    
    // Request ID counter
    property int _requestIdCounter: 0
    
    // Generate unique ID
    function _generateId() {
        _requestIdCounter++
        return "req_" + _requestIdCounter + "_" + Date.now()
    }
    
    /**
     * Add a new request to the queue
     * @param label - Display name for the request
     * @param options - Optional: { progress: { current, total }, group: string }
     * @returns request ID
     */
    function addRequest(label, options) {
        options = options || {}
        const id = _generateId()
        const request = {
            id: id,
            label: label,
            status: "pending", // pending, success, error
            startTime: Date.now(),
            endTime: null,
            error: null,
            progress: options.progress || null,
            group: options.group || null
        }
        
        queue = [...queue, request]
        pending = _countByStatus("pending")
        isVisible = true
        
        return id
    }
    
    /**
     * Update a request's status
     * @param id - Request ID
     * @param updates - { status, error, progress }
     */
    function updateRequest(id, updates) {
        queue = queue.map(function(req) {
            if (req.id !== id) return req
            
            const updated = Object.assign({}, req, updates)
            if (updates.status === "success" || updates.status === "error") {
                updated.endTime = Date.now()
            }
            return updated
        })
        
        pending = _countByStatus("pending")
        completed = _countByStatus("success")
        failed = _countByStatus("error")
        
        // Auto-hide after 3 seconds if no pending
        if (pending === 0) {
            _autoHideTimer.restart()
        }
    }
    
    /**
     * Clear all completed/failed requests
     */
    function clearQueue() {
        queue = queue.filter(function(r) {
            return r.status === "pending"
        })
        
        completed = 0
        failed = 0
        
        if (queue.length === 0) {
            isVisible = false
        }
    }
    
    /**
     * Get elapsed time string
     */
    function getElapsedTime(startTime, endTime) {
        const elapsed = (endTime || Date.now()) - startTime
        if (elapsed < 1000) return elapsed + "ms"
        return (elapsed / 1000).toFixed(1) + "s"
    }
    
    // Internal: count by status
    function _countByStatus(status) {
        return queue.filter(function(r) {
            return r.status === status
        }).length
    }
    
    // Auto-hide timer
    property Timer _autoHideTimer: Timer {
        interval: 3000
        onTriggered: {
            if (ajaxQueue.pending === 0) {
                // Clear old completed requests
                const cutoff = Date.now() - 2000
                ajaxQueue.queue = ajaxQueue.queue.filter(function(r) {
                    return r.status === "pending" || (r.endTime && r.endTime > cutoff)
                })
                
                if (ajaxQueue.queue.length === 0) {
                    ajaxQueue.isVisible = false
                }
            }
        }
    }
}

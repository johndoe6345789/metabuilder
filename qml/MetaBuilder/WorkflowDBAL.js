.pragma library

// DBAL persistence helpers for workflow entities.
// Each function takes a dbal provider instance and callbacks
// so the caller can update QML state on completion.

function loadWorkflows(dbal, mockWorkflows, callback) {
    dbal.list("workflow", { take: 50 }, function(result, error) {
        if (!error && result && result.items && result.items.length > 0) {
            var parsed = []
            for (var i = 0; i < result.items.length; i++) {
                var w = result.items[i]
                parsed.push({
                    id: w.id || "",
                    name: w.name || "unnamed_workflow",
                    active: w.active !== undefined ? w.active : true,
                    settings: w.settings || {},
                    tags: w.tags || [],
                    meta: w.meta || {},
                    variables: w.variables || {},
                    nodes: w.nodes || [],
                    connections: w.connections || {}
                })
            }
            callback(parsed)
        } else {
            callback(JSON.parse(JSON.stringify(mockWorkflows)))
        }
    })
}

function saveWorkflow(dbal, wf, onSaved) {
    if (wf.id) {
        dbal.update("workflow", wf.id, wf, function(result, error) {
            if (onSaved) onSaved(result, error)
        })
    } else {
        dbal.create("workflow", wf, function(result, error) {
            if (onSaved) onSaved(result, error)
        })
    }
}

function deleteWorkflow(dbal, wf, onDeleted, onFallback) {
    if (wf.id) {
        dbal.remove("workflow", wf.id, function(result, error) {
            if (!error) {
                if (onDeleted) onDeleted()
            } else {
                if (onFallback) onFallback()
            }
        })
    } else {
        if (onFallback) onFallback()
    }
}

function loadMockData(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var data = []
            if (xhr.status === 200 || xhr.status === 0) {
                try {
                    data = JSON.parse(xhr.responseText)
                } catch (e) {
                    console.warn("WorkflowDBAL: failed to parse mock data:", e)
                }
            }
            callback(data)
        }
    }
    xhr.open("GET", url)
    xhr.send()
}

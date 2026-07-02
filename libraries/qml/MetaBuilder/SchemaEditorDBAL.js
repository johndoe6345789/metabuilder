.pragma library

// DBAL persistence and schema CRUD helpers
// for schema editor.

function loadSchemas(dbal, callback) {
    dbal.execute("core/schema", {},
        function(result, error) {
        if (!error && result && result.items) {
            var parsed = []
            for (var i = 0;
                 i < result.items.length; i++) {
                var item = result.items[i]
                var fields = []
                if (item.fields) {
                    for (var j = 0;
                         j < item.fields.length;
                         j++) {
                        var f = item.fields[j]
                        fields.push({
                            name: f.name || "",
                            type: f.type
                                || "string",
                            required:
                                f.required || false,
                            defaultValue:
                                f.defaultValue
                                || f["default"]
                                || "",
                            description:
                                f.description || ""
                        })
                    }
                }
                parsed.push({
                    name: item.name || "",
                    description:
                        item.description || "",
                    fields: fields
                })
            }
            if (parsed.length > 0)
                callback(parsed)
        }
    })
}

function currentSchema(schemas, idx) {
    return (schemas || [])[idx] || null
}

function currentFields(schemas, idx) {
    var s = currentSchema(schemas, idx)
    return s ? s.fields : []
}

function currentField(schemas, schemaIdx,
                      fieldIdx) {
    var fields = currentFields(schemas, schemaIdx)
    return (fieldIdx >= 0
        && fieldIdx < fields.length)
        ? fields[fieldIdx] : null
}

function updateField(schemas, schemaIdx,
                     fieldIdx, key, value) {
    var copy = JSON.parse(JSON.stringify(schemas))
    copy[schemaIdx].fields[fieldIdx][key] = value
    return copy
}

function addSchema(schemas, name, description,
                   dbal, loadFn) {
    if (name.trim() === "") return null
    var schemaData = {
        name: name.trim(),
        description: description.trim(),
        fields: [{
            name: "id", type: "string",
            required: true,
            defaultValue: "uuid()",
            description: "Primary key"
        }]
    }
    if (dbal && dbal.connected) {
        dbal.create("schema", schemaData,
            function(result, error) {
                if (!error) loadFn()
            })
    }
    var copy = JSON.parse(JSON.stringify(schemas))
    copy.push(schemaData)
    return {
        schemas: copy,
        selectedIndex: copy.length - 1
    }
}

function deleteSchema(schemas, selectedIndex) {
    if (schemas.length <= 1) return null
    var copy = JSON.parse(JSON.stringify(schemas))
    copy.splice(selectedIndex, 1)
    var newIdx = selectedIndex >= copy.length
        ? copy.length - 1 : selectedIndex
    return {
        schemas: copy, selectedIndex: newIdx
    }
}

function addField(schemas, schemaIdx, fieldData) {
    if (fieldData.name.trim() === "") return null
    var copy = JSON.parse(JSON.stringify(schemas))
    copy[schemaIdx].fields.push({
        name: fieldData.name.trim(),
        type: fieldData.type,
        required: fieldData.required,
        defaultValue: fieldData.defaultValue,
        description: fieldData.description
    })
    return {
        schemas: copy,
        selectedFieldIndex:
            copy[schemaIdx].fields.length - 1
    }
}

function deleteField(schemas, schemaIdx,
                     fieldIdx) {
    if (fieldIdx < 0) return schemas
    var copy = JSON.parse(JSON.stringify(schemas))
    copy[schemaIdx].fields.splice(fieldIdx, 1)
    return copy
}

function loadJson(relativePath) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", relativePath, false)
    xhr.send()
    if (xhr.status === 200 || xhr.status === 0) {
        try { return JSON.parse(xhr.responseText) }
        catch(e) { return [] }
    }
    return []
}

// AdminCrud.js — CRUD helpers for AdminView entity management

function loadJson(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && (xhr.status === 200 || xhr.status === 0))
            callback(JSON.parse(xhr.responseText));
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function filterRecords(data, activeFilter, searchText, fields) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var rec = data[i];
        if (activeFilter === "Active" && rec.status !== "Active") continue;
        if (activeFilter === "Inactive" && rec.status !== "Inactive") continue;
        if (searchText.length > 0) {
            var match = false;
            for (var f = 0; f < fields.length; f++) {
                if (String(rec[fields[f]]).toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                    match = true; break;
                }
            }
            if (!match) continue;
        }
        result.push(rec);
    }
    return result;
}

function replaceEntity(records, entity, newData) {
    var updated = Object.assign({}, records);
    updated[entity] = newData;
    return updated;
}

function removeById(dataSlice, id) {
    for (var i = 0; i < dataSlice.length; i++) {
        if (dataSlice[i].id === id) { dataSlice.splice(i, 1); break; }
    }
    return dataSlice;
}

function removeByIds(dataSlice, idsToDelete) {
    var result = [];
    for (var i = 0; i < dataSlice.length; i++) {
        if (!idsToDelete[dataSlice[i].id]) result.push(dataSlice[i]);
    }
    return result;
}

function collectSelectedIds(selectedRows, pagedRecs) {
    var ids = {};
    for (var key in selectedRows) {
        if (selectedRows[key]) {
            var rec = pagedRecs[parseInt(key)];
            if (rec) ids[rec.id] = true;
        }
    }
    return ids;
}

function generateId(idPrefixes, entity, records) {
    var prefix = idPrefixes[entity] || "REC";
    var num = (records[entity] || []).length + 1;
    return prefix + "-" + String(num).padStart(3, '0');
}

function buildFormFields(entityFields, entityColumns, entity, editingRecord, includeValues) {
    var fields = entityFields[entity] || [];
    var cols = entityColumns[entity] || [];
    var result = [];
    for (var i = 1; i < fields.length; i++) {
        var entry = { field: fields[i], label: cols[i] || fields[i] };
        if (includeValues) entry.value = editingRecord[fields[i]] || "";
        result.push(entry);
    }
    return result;
}

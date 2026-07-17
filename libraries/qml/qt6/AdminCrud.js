// AdminCrud.js — CRUD helpers for AdminView
// entity management

function loadJson(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE
            && (xhr.status === 200
                || xhr.status === 0))
            try {
                callback(JSON.parse(
                    xhr.responseText));
            } catch(e) { callback(null); }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function filterRecords(data, activeFilter,
                       searchText, fields) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var rec = data[i];
        if (activeFilter === "Active"
            && rec.status !== "Active")
            continue;
        if (activeFilter === "Inactive"
            && rec.status !== "Inactive")
            continue;
        if (searchText.length > 0) {
            var match = false;
            for (var f = 0;
                 f < fields.length; f++) {
                if (String(rec[fields[f]])
                    .toLowerCase()
                    .indexOf(
                        searchText.toLowerCase()
                    ) >= 0) {
                    match = true;
                    break;
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
        if (dataSlice[i].id === id) {
            dataSlice.splice(i, 1);
            break;
        }
    }
    return dataSlice;
}

function removeByIds(dataSlice, idsToDelete) {
    var result = [];
    for (var i = 0; i < dataSlice.length; i++) {
        if (!idsToDelete[dataSlice[i].id])
            result.push(dataSlice[i]);
    }
    return result;
}

function collectSelectedIds(selectedRows,
                            pagedRecs) {
    var ids = {};
    for (var key in selectedRows) {
        if (selectedRows[key]) {
            var rec = pagedRecs[parseInt(key)];
            if (rec) ids[rec.id] = true;
        }
    }
    return ids;
}

function generateId(idPrefixes, entity,
                    records) {
    var prefix = idPrefixes[entity] || "REC";
    var num = (records[entity] || []).length + 1;
    return prefix + "-"
        + String(num).padStart(3, '0');
}

function buildFormFields(entityFields,
                         entityColumns, entity,
                         editingRecord,
                         includeValues) {
    var fields = (entityFields || {})[entity] || [];
    var cols = (entityColumns || {})[entity] || [];
    var result = [];
    for (var i = 1; i < fields.length; i++) {
        var entry = {
            field: fields[i],
            label: cols[i] || fields[i]
        };
        if (includeValues)
            entry.value =
                editingRecord[fields[i]] || "";
        result.push(entry);
    }
    return result;
}

function buildNewRecord(idPrefixes,
                        entityFields, entity,
                        records, data) {
    var rec = {
        id: generateId(
            idPrefixes, entity, records)
    };
    var fk = entityFields[entity];
    for (var f = 1; f < fk.length; f++)
        rec[fk[f]] = data[fk[f]] || "";
    if (!rec.status) rec.status = "Active";
    return rec;
}

function buildUpdatedRecord(entityFields, entity,
                            editingRecord, data) {
    var rec = { id: editingRecord.id };
    var fk = entityFields[entity];
    for (var f = 1; f < fk.length; f++)
        rec[fk[f]] = data[fk[f]]
            || editingRecord[fk[f]] || "";
    return rec;
}

function addToEntity(records, entity, rec) {
    var d = records[entity].slice();
    d.push(rec);
    return replaceEntity(records, entity, d);
}

function updateInEntity(records, entity,
                        targetId, updatedRec) {
    var d = records[entity].slice();
    for (var i = 0; i < d.length; i++) {
        if (d[i].id === targetId) {
            d[i] = updatedRec;
            break;
        }
    }
    return replaceEntity(records, entity, d);
}

function adminStats(records) {
    return [
        { label: "Total Users",
          value: (records["User"]||[]).length,
          accent: "#4CAF50" },
        { label: "Active Sessions",
          value: (records["Session"]||[]).length,
          accent: "#2196F3" },
        { label: "Workflows",
          value: (records["Workflow"]||[]).length,
          accent: "#FF9800" },
        { label: "Audit Events",
          value: (records["AuditLog"]||[]).length,
          accent: "#9C27B0" }
    ];
}

function entityCounts(entities, records) {
    var c = {};
    for (var i = 0; i < entities.length; i++)
        c[entities[i]] =
            (records[entities[i]]||[]).length;
    return c;
}

function parseLiveData(items, fields) {
    var live = [];
    for (var i = 0; i < items.length; i++) {
        var r = {};
        for (var f = 0; f < fields.length; f++)
            r[fields[f]] = items[i][fields[f]] || "";
        live.push(r);
    }
    return live;
}

function clampPage(currentPage, totalPages) {
    return currentPage >= totalPages
        ? Math.max(0, totalPages - 1)
        : currentPage;
}

function doCreate(root, dbal, dlg, data) {
    var n = buildNewRecord(root.idPfx,
        root.entFlds, root.selEnt,
        root.records, data);
    if (root.useLiveData)
        dbal.create(root.selEnt, n,
            function(r, e) {
                if (!e) root.loadData();
                else root.records =
                    addToEntity(root.records,
                        root.selEnt, n);
            });
    else root.records = addToEntity(
        root.records, root.selEnt, n);
    dlg.createDialogOpen = false;
}

function doEdit(root, dbal, dlg, data) {
    var u = buildUpdatedRecord(root.entFlds,
        root.selEnt, root.editRec, data);
    var pg = root.pg();
    var tid = pg[root.editIdx]
        ? pg[root.editIdx].id : "";
    if (root.useLiveData)
        dbal.update(root.selEnt, tid, u,
            function(r, e) {
                if (!e) root.loadData();
                else root.records =
                    updateInEntity(root.records,
                        root.selEnt, tid, u);
            });
    else root.records = updateInEntity(
        root.records, root.selEnt, tid, u);
    dlg.editDialogOpen = false;
}

function doDelete(root, dbal, dlg) {
    var pg = root.pg();
    var rec = pg[root.editIdx];
    if (!rec) { dlg.deleteDialogOpen = false; return; }
    if (root.useLiveData)
        dbal.remove(root.selEnt, rec.id,
            function(r, e) {
                if (!e) root.loadData();
                else root.records =
                    replaceEntity(root.records,
                        root.selEnt,
                        removeById(
                            root.records[root.selEnt]
                                .slice(), rec.id));
            });
    else root.records = replaceEntity(
        root.records, root.selEnt,
        removeById(
            root.records[root.selEnt].slice(),
            rec.id));
    root.selRow = -1;
    root.curPage = clampPage(
        root.curPage,
        Math.max(1, Math.ceil(
            root.fil().length / root.pgSize)));
    dlg.deleteDialogOpen = false;
}

function handleCreate(ctx, data) {
    var n = buildNewRecord(ctx.idPrefixes,
        ctx.entityFields, ctx.selectedEntity,
        ctx.records, data);
    return { record: n };
}

function handleEdit(ctx, data) {
    var u = buildUpdatedRecord(ctx.entityFields,
        ctx.selectedEntity, ctx.editingRecord,
        data);
    var tid = ctx.pagedRow
        ? ctx.pagedRow.id : "";
    return { record: u, targetId: tid };
}

function resetEntity(root) {
    root.currentPage = 0;
    root.selectedRow = -1;
    root.selectedRows = {};
    root.selectAll = false;
    root.searchText = "";
    root.activeFilter = "All";
}

function deleteSelectedRows(records, entity,
                            selectedRows,
                            pagedRecs) {
    var ids = collectSelectedIds(
        selectedRows, pagedRecs);
    return replaceEntity(records, entity,
        removeByIds(
            records[entity].slice(), ids));
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "AdminCrud.js" as Crud

Rectangle {
    id: root; color: Theme.background
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property bool configLoaded: false
    property string selectedEntity: "User"; property string searchText: ""; property string activeFilter: "All"
    property int currentPage: 0; property int pageSize: 5; property int selectedRow: -1
    property var selectedRows: ({}); property bool selectAll: false
    property int editingIndex: -1; property var editingRecord: ({})
    property var entities: []; property var entityIcons: ({}); property var entityColumns: ({})
    property var entityFields: ({}); property var idPrefixes: ({}); property var records: ({})

    function filtered() { return Crud.filterRecords(records[selectedEntity] || [], activeFilter, searchText, entityFields[selectedEntity] || []); }
    function paged() { return filtered().slice(currentPage * pageSize, (currentPage + 1) * pageSize); }
    function pages() { return Math.max(1, Math.ceil(filtered().length / pageSize)); }
    function hasSelected() { for (var k in selectedRows) { if (selectedRows[k]) return true; } return false; }
    function fixPage() { currentPage = Crud.clampPage(currentPage, pages()); }
    function saveOrFallback(action, fallback) { if (useLiveData) action(function(r,e) { if (!e) loadEntityData(); else fallback(); }); else fallback(); }
    function loadEntityData() {
        if (!useLiveData) return;
        dbal.list(selectedEntity, { take: pageSize, skip: currentPage * pageSize }, function(result, error) {
            if (error || !result) return;
            var items = result.items || [], fields = entityFields[selectedEntity] || [], live = [];
            for (var i = 0; i < items.length; i++) { var r = {}; for (var f = 0; f < fields.length; f++) r[fields[f]] = items[i][fields[f]] || ""; live.push(r); }
            records = Crud.replaceEntity(records, selectedEntity, live);
        });
    }
    Component.onCompleted: {
        Crud.loadJson("config/admin-entities.json", function(d) { entities = d.entities; entityIcons = d.icons; entityColumns = d.columns; entityFields = d.fields; idPrefixes = d.idPrefixes; configLoaded = true; });
        Crud.loadJson("config/admin-mock-data.json", function(d) { if (!useLiveData) records = d; });
        if (useLiveData) loadEntityData();
    }
    onUseLiveDataChanged: if (useLiveData) loadEntityData()
    onSelectedEntityChanged: { currentPage = 0; selectedRow = -1; selectedRows = {}; selectAll = false; searchText = ""; activeFilter = "All"; if (useLiveData) loadEntityData(); }

    ColumnLayout {
        anchors.fill: parent; spacing: 0; visible: configLoaded
        CAdminStatsBar { stats: [{ label: "Total Users", value: (records["User"]||[]).length, accent: "#4CAF50" }, { label: "Active Sessions", value: (records["Session"]||[]).length, accent: "#2196F3" }, { label: "Workflows", value: (records["Workflow"]||[]).length, accent: "#FF9800" }, { label: "Audit Events", value: (records["AuditLog"]||[]).length, accent: "#9C27B0" }] }
        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0
            CEntitySidebar {
                entities: root.entities; entityIcons: root.entityIcons; selectedEntity: root.selectedEntity
                entityCounts: { var c = {}; for (var i = 0; i < root.entities.length; i++) c[root.entities[i]] = (records[root.entities[i]]||[]).length; return c; }
                onEntitySelected: function(n) { root.selectedEntity = n; }
            }
            Rectangle {
                Layout.fillWidth: true; Layout.fillHeight: true; color: Theme.background
                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 12
                    CAdminToolbar {
                        Layout.fillWidth: true; selectedEntity: root.selectedEntity; searchText: root.searchText; activeFilter: root.activeFilter
                        entityIcons: root.entityIcons; useLiveData: root.useLiveData; hasSelectedRows: hasSelected()
                        onSearchChanged: function(t) { searchText = t; currentPage = 0; }
                        onFilterChanged: function(f) { activeFilter = f; currentPage = 0; }
                        onCreateClicked: { editingRecord = {}; dialogs.createDialogOpen = true; }
                        onDeleteSelectedClicked: { records = Crud.deleteSelectedRows(records, selectedEntity, selectedRows, paged()); selectedRows = {}; selectAll = false; selectedRow = -1; fixPage(); }
                    }
                    CDataTable {
                        headers: entityColumns[selectedEntity] || []; fields: entityFields[selectedEntity] || []; rows: paged()
                        totalFiltered: filtered().length; page: currentPage; pageSize: root.pageSize
                        selectedRow: root.selectedRow; selectedRows: root.selectedRows; selectAll: root.selectAll
                        onRowClicked: function(i) { root.selectedRow = i; }
                        onPageRequested: function(p) { root.currentPage = p; }
                        onRowSelectionChanged: function(s) { root.selectedRows = s; }
                        onSelectAllChanged: function(c) { root.selectAll = c; }
                        onEditClicked: function(i, r) { editingIndex = i; editingRecord = Object.assign({}, r); dialogs.editDialogOpen = true; }
                        onDeleteClicked: function(i) { editingIndex = i; dialogs.deleteDialogOpen = true; }
                    }
                }
            }
        }
    }
    CAdminDialogs {
        id: dialogs; selectedEntity: root.selectedEntity; useLiveData: root.useLiveData
        fields: dialogs.editDialogOpen ? Crud.buildFormFields(entityFields, entityColumns, selectedEntity, editingRecord, true) : Crud.buildFormFields(entityFields, entityColumns, selectedEntity, editingRecord, false)
        editId: editingRecord.id || ""; deleteRecordId: { var r = paged()[editingIndex]; return r ? r.id : ""; }
        onCreateSaved: function(data) { var n = Crud.buildNewRecord(idPrefixes, entityFields, selectedEntity, records, data); saveOrFallback(function(cb) { dbal.create(selectedEntity, n, cb); }, function() { records = Crud.addToEntity(records, selectedEntity, n); }); dialogs.createDialogOpen = false; }
        onEditSaved: function(data) { var u = Crud.buildUpdatedRecord(entityFields, selectedEntity, editingRecord, data); var tid = paged()[editingIndex] ? paged()[editingIndex].id : ""; saveOrFallback(function(cb) { dbal.update(selectedEntity, tid, u, cb); }, function() { records = Crud.updateInEntity(records, selectedEntity, tid, u); }); dialogs.editDialogOpen = false; }
        onCreateCancelled: dialogs.createDialogOpen = false
        onEditCancelled: dialogs.editDialogOpen = false
        onDeleteConfirmed: { var rec = paged()[editingIndex]; if (rec) saveOrFallback(function(cb) { dbal.remove(selectedEntity, rec.id, cb); }, function() { records = Crud.replaceEntity(records, selectedEntity, Crud.removeById(records[selectedEntity].slice(), rec.id)); }); selectedRow = -1; fixPage(); dialogs.deleteDialogOpen = false; }
        onDeleteCancelled: dialogs.deleteDialogOpen = false
    }
}

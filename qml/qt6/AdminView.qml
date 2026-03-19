import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "AdminCrud.js" as Crud

Rectangle {
    id: root
    color: Theme.background

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property bool configLoaded: false
    property string selectedEntity: "User"
    property string searchText: ""
    property string activeFilter: "All"
    property int currentPage: 0
    property int pageSize: 5
    property int selectedRow: -1
    property var selectedRows: ({})
    property bool selectAll: false
    property int editingIndex: -1
    property var editingRecord: ({})

    property var entities: []
    property var entityIcons: ({})
    property var entityColumns: ({})
    property var entityFields: ({})
    property var idPrefixes: ({})
    property var records: ({})

    function getFilteredRecords() { return Crud.filterRecords(records[selectedEntity] || [], activeFilter, searchText, entityFields[selectedEntity] || []); }
    function getPagedRecords() { return getFilteredRecords().slice(currentPage * pageSize, (currentPage + 1) * pageSize); }
    function totalFiltered() { return getFilteredRecords().length; }
    function totalPages() { return Math.max(1, Math.ceil(totalFiltered() / pageSize)); }
    function statCount(entity) { return (records[entity] || []).length; }
    function hasSelectedRows() { for (var key in selectedRows) { if (selectedRows[key]) return true; } return false; }

    function loadEntityData() {
        if (!useLiveData) return;
        dbal.list(selectedEntity, { take: pageSize, skip: currentPage * pageSize }, function(result, error) {
            if (error || !result) return;
            var liveRecords = [], items = result.items || [], fields = entityFields[selectedEntity] || [];
            for (var i = 0; i < items.length; i++) { var rec = {}; for (var f = 0; f < fields.length; f++) rec[fields[f]] = items[i][fields[f]] || ""; liveRecords.push(rec); }
            records = Crud.replaceEntity(records, selectedEntity, liveRecords);
        });
    }

    Component.onCompleted: {
        Crud.loadJson("config/admin-entities.json", function(data) { entities = data.entities; entityIcons = data.icons; entityColumns = data.columns; entityFields = data.fields; idPrefixes = data.idPrefixes; configLoaded = true; });
        Crud.loadJson("config/admin-mock-data.json", function(data) { if (!useLiveData) records = data; });
        if (useLiveData) loadEntityData();
    }
    onUseLiveDataChanged: { if (useLiveData) loadEntityData(); }
    onSelectedEntityChanged: { currentPage = 0; selectedRow = -1; selectedRows = {}; selectAll = false; searchText = ""; activeFilter = "All"; if (useLiveData) loadEntityData(); }

    ColumnLayout {
        anchors.fill: parent; spacing: 0; visible: configLoaded

        CAdminStatsBar { stats: [ { label: "Total Users", value: statCount("User"), accent: "#4CAF50" }, { label: "Active Sessions", value: statCount("Session"), accent: "#2196F3" }, { label: "Workflows", value: statCount("Workflow"), accent: "#FF9800" }, { label: "Audit Events", value: statCount("AuditLog"), accent: "#9C27B0" } ] }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0

            CEntitySidebar {
                entities: root.entities; entityIcons: root.entityIcons; selectedEntity: root.selectedEntity
                entityCounts: { var c = {}; for (var i = 0; i < root.entities.length; i++) c[root.entities[i]] = statCount(root.entities[i]); return c; }
                onEntitySelected: function(name) { root.selectedEntity = name; }
            }

            Rectangle {
                Layout.fillWidth: true; Layout.fillHeight: true; color: Theme.background
                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 12

                    CAdminToolbar {
                        Layout.fillWidth: true; selectedEntity: root.selectedEntity; searchText: root.searchText; activeFilter: root.activeFilter
                        entityIcons: root.entityIcons; useLiveData: root.useLiveData; hasSelectedRows: root.hasSelectedRows()
                        onSearchChanged: function(t) { searchText = t; currentPage = 0; }
                        onFilterChanged: function(f) { activeFilter = f; currentPage = 0; }
                        onCreateClicked: { editingRecord = {}; dialogs.createDialogOpen = true; }
                        onDeleteSelectedClicked: {
                            var ids = Crud.collectSelectedIds(selectedRows, getPagedRecords());
                            records = Crud.replaceEntity(records, selectedEntity, Crud.removeByIds(records[selectedEntity].slice(), ids));
                            selectedRows = {}; selectAll = false; selectedRow = -1; if (currentPage >= totalPages()) currentPage = Math.max(0, totalPages() - 1);
                        }
                    }

                    CDataTable {
                        headers: entityColumns[selectedEntity] || []; fields: entityFields[selectedEntity] || []; rows: getPagedRecords()
                        totalFiltered: root.totalFiltered(); page: currentPage; pageSize: root.pageSize
                        selectedRow: root.selectedRow; selectedRows: root.selectedRows; selectAll: root.selectAll
                        onRowClicked: function(i) { root.selectedRow = i; }
                        onPageRequested: function(p) { root.currentPage = p; }
                        onRowSelectionChanged: function(s) { root.selectedRows = s; }
                        onSelectAllChanged: function(c) { root.selectAll = c; }
                        onEditClicked: function(i, r) { editingIndex = i; editingRecord = Object.assign({}, r); dialogs.editDialogOpen = true; }
                        onDeleteClicked: function(i, r) { editingIndex = i; dialogs.deleteDialogOpen = true; }
                    }
                }
            }
        }
    }

    CAdminDialogs {
        id: dialogs; selectedEntity: root.selectedEntity; useLiveData: root.useLiveData
        fields: dialogs.createDialogOpen ? Crud.buildFormFields(entityFields, entityColumns, selectedEntity, editingRecord, false) : Crud.buildFormFields(entityFields, entityColumns, selectedEntity, editingRecord, true)
        editId: editingRecord.id || ""; deleteRecordId: { var r = getPagedRecords()[editingIndex]; return r ? r.id : ""; }
        onCreateSaved: function(data) { var n = { id: Crud.generateId(idPrefixes, selectedEntity, records) }; var fk = entityFields[selectedEntity]; for (var f = 1; f < fk.length; f++) n[fk[f]] = data[fk[f]] || ""; if (!n.status) n.status = "Active"; if (useLiveData) dbal.create(selectedEntity, n, function(r,e) { if (!e) loadEntityData(); else { var d = records[selectedEntity].slice(); d.push(n); records = Crud.replaceEntity(records, selectedEntity, d); } }); else { var d2 = records[selectedEntity].slice(); d2.push(n); records = Crud.replaceEntity(records, selectedEntity, d2); } dialogs.createDialogOpen = false; }
        onEditSaved: function(data) { var u = { id: editingRecord.id }; var fk = entityFields[selectedEntity]; for (var f = 1; f < fk.length; f++) u[fk[f]] = data[fk[f]] || editingRecord[fk[f]] || ""; if (useLiveData) dbal.update(selectedEntity, editingRecord.id, u, function(r,e) { if (!e) loadEntityData(); else { var d = records[selectedEntity].slice(); var tid = getPagedRecords()[editingIndex] ? getPagedRecords()[editingIndex].id : ""; for (var i = 0; i < d.length; i++) { if (d[i].id === tid) { d[i] = u; break; } } records = Crud.replaceEntity(records, selectedEntity, d); } }); else { var d2 = records[selectedEntity].slice(); var tid2 = getPagedRecords()[editingIndex] ? getPagedRecords()[editingIndex].id : ""; for (var i2 = 0; i2 < d2.length; i2++) { if (d2[i2].id === tid2) { d2[i2] = u; break; } } records = Crud.replaceEntity(records, selectedEntity, d2); } dialogs.editDialogOpen = false; }
        onCreateCancelled: dialogs.createDialogOpen = false
        onEditCancelled: dialogs.editDialogOpen = false
        onDeleteConfirmed: { var rec = getPagedRecords()[editingIndex]; if (useLiveData && rec) dbal.remove(selectedEntity, rec.id, function(r,e) { if (!e) loadEntityData(); else { records = Crud.replaceEntity(records, selectedEntity, Crud.removeById(records[selectedEntity].slice(), rec.id)); } }); else if (rec) records = Crud.replaceEntity(records, selectedEntity, Crud.removeById(records[selectedEntity].slice(), rec.id)); selectedRow = -1; if (currentPage >= totalPages()) currentPage = Math.max(0, totalPages() - 1); dialogs.deleteDialogOpen = false; }
        onDeleteCancelled: dialogs.deleteDialogOpen = false
    }
}

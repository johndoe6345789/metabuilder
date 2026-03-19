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

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    function loadEntityData() {
        if (!useLiveData) return;
        dbal.list(selectedEntity, { take: pageSize, skip: currentPage * pageSize }, function(result, error) {
            if (error || !result) return;
            var items = result.items || [];
            var fields = entityFields[selectedEntity] || [];
            var liveRecords = [];
            for (var i = 0; i < items.length; i++) {
                var rec = {};
                for (var f = 0; f < fields.length; f++) rec[fields[f]] = items[i][fields[f]] || "";
                liveRecords.push(rec);
            }
            records = Crud.replaceEntity(records, selectedEntity, liveRecords);
        });
    }

    Component.onCompleted: {
        Crud.loadJson("config/admin-entities.json", function(data) {
            entities = data.entities; entityIcons = data.icons;
            entityColumns = data.columns; entityFields = data.fields;
            idPrefixes = data.idPrefixes; configLoaded = true;
        });
        Crud.loadJson("config/admin-mock-data.json", function(data) {
            if (!useLiveData) records = data;
        });
        if (useLiveData) loadEntityData();
    }
    onUseLiveDataChanged: { if (useLiveData) loadEntityData(); }

    // ── State ────────────────────────────────────────────────────
    property bool configLoaded: false
    property string selectedEntity: "User"
    property string searchText: ""
    property string activeFilter: "All"
    property int currentPage: 0
    property int pageSize: 5
    property int selectedRow: -1
    property var selectedRows: ({})
    property bool selectAll: false
    property bool createDialogOpen: false
    property bool editDialogOpen: false
    property bool deleteDialogOpen: false
    property int editingIndex: -1
    property var editingRecord: ({})

    // ── Entity config (loaded from JSON) ─────────────────────────
    property var entities: []
    property var entityIcons: ({})
    property var entityColumns: ({})
    property var entityFields: ({})
    property var idPrefixes: ({})
    property var records: ({})

    // ── Computed helpers ──────────────────────────────────────────
    function getFilteredRecords() {
        return Crud.filterRecords(records[selectedEntity] || [], activeFilter, searchText, entityFields[selectedEntity] || []);
    }
    function getPagedRecords() { return getFilteredRecords().slice(currentPage * pageSize, (currentPage + 1) * pageSize); }
    function totalFiltered() { return getFilteredRecords().length; }
    function totalPages() { return Math.max(1, Math.ceil(totalFiltered() / pageSize)); }
    function statCount(entity) { return (records[entity] || []).length; }

    function deleteRecord(idx) {
        var actualRec = getPagedRecords()[idx];
        records = Crud.replaceEntity(records, selectedEntity, Crud.removeById(records[selectedEntity].slice(), actualRec.id));
        selectedRow = -1;
        if (currentPage >= totalPages()) currentPage = Math.max(0, totalPages() - 1);
    }

    function deleteSelectedRows() {
        var ids = Crud.collectSelectedIds(selectedRows, getPagedRecords());
        records = Crud.replaceEntity(records, selectedEntity, Crud.removeByIds(records[selectedEntity].slice(), ids));
        selectedRows = {}; selectAll = false; selectedRow = -1;
        if (currentPage >= totalPages()) currentPage = Math.max(0, totalPages() - 1);
    }

    function addRecord(rec) {
        var data = records[selectedEntity].slice(); data.push(rec);
        records = Crud.replaceEntity(records, selectedEntity, data);
    }

    function updateRecord(rec) {
        var data = records[selectedEntity].slice();
        var targetId = getPagedRecords()[editingIndex] ? getPagedRecords()[editingIndex].id : "";
        for (var i = 0; i < data.length; i++) { if (data[i].id === targetId) { data[i] = rec; break; } }
        records = Crud.replaceEntity(records, selectedEntity, data);
    }

    function hasSelectedRows() { for (var key in selectedRows) { if (selectedRows[key]) return true; } return false; }

    onSelectedEntityChanged: {
        currentPage = 0; selectedRow = -1; selectedRows = {};
        selectAll = false; searchText = ""; activeFilter = "All";
        if (useLiveData) loadEntityData();
    }

    // ── Layout ───────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent; spacing: 0; visible: configLoaded

        CAdminStatsBar {
            stats: [
                { label: "Total Users",     value: statCount("User"),     accent: "#4CAF50" },
                { label: "Active Sessions", value: statCount("Session"),  accent: "#2196F3" },
                { label: "Workflows",       value: statCount("Workflow"), accent: "#FF9800" },
                { label: "Audit Events",    value: statCount("AuditLog"), accent: "#9C27B0" }
            ]
        }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0

            CEntitySidebar {
                entities: root.entities
                entityIcons: root.entityIcons
                selectedEntity: root.selectedEntity
                entityCounts: {
                    var counts = {};
                    for (var i = 0; i < root.entities.length; i++) counts[root.entities[i]] = statCount(root.entities[i]);
                    return counts;
                }
                onEntitySelected: function(name) { root.selectedEntity = name; }
            }

            Rectangle {
                Layout.fillWidth: true; Layout.fillHeight: true; color: Theme.background

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 12

                    FlexRow {
                        Layout.fillWidth: true; spacing: 12
                        CText { variant: "h3"; text: (entityIcons[selectedEntity] || "") + "  " + selectedEntity + " Management" }
                        CStatusBadge { status: useLiveData ? "success" : "warning"; text: useLiveData ? "Live" : "Mock" }
                        Item { Layout.fillWidth: true }
                        CButton { text: "Create Record"; variant: "primary"; size: "sm"; onClicked: { editingRecord = {}; createDialogOpen = true; } }
                    }

                    FlexRow {
                        Layout.fillWidth: true; spacing: 8
                        CTextField {
                            Layout.preferredWidth: 280; label: "Search"
                            placeholderText: "Filter " + selectedEntity.toLowerCase() + " records..."
                            text: searchText; onTextChanged: { searchText = text; currentPage = 0; }
                        }
                        Item { Layout.preferredWidth: 12 }
                        Repeater {
                            model: ["All", "Active", "Inactive"]
                            delegate: CChip {
                                text: modelData; checked: activeFilter === modelData
                                chipColor: activeFilter === modelData ? Theme.primary : Theme.surface
                                onClicked: { activeFilter = modelData; currentPage = 0; }
                            }
                        }
                        Item { Layout.fillWidth: true }
                        CButton { text: "Delete Selected"; variant: "danger"; size: "sm"; enabled: hasSelectedRows(); onClicked: deleteSelectedRows() }
                    }

                    CDataTable {
                        headers: entityColumns[selectedEntity] || []
                        fields: entityFields[selectedEntity] || []
                        rows: getPagedRecords()
                        totalFiltered: root.totalFiltered()
                        page: currentPage; pageSize: root.pageSize
                        selectedRow: root.selectedRow; selectedRows: root.selectedRows; selectAll: root.selectAll
                        onRowClicked: function(index) { root.selectedRow = index; }
                        onPageRequested: function(page) { root.currentPage = page; }
                        onRowSelectionChanged: function(sel) { root.selectedRows = sel; }
                        onSelectAllChanged: function(checked) { root.selectAll = checked; }
                        onEditClicked: function(index, record) { editingIndex = index; editingRecord = Object.assign({}, record); editDialogOpen = true; }
                        onDeleteClicked: function(index, record) { editingIndex = index; deleteDialogOpen = true; }
                    }
                }
            }
        }
    }

    // ── Create dialog ────────────────────────────────────────────
    CEntityForm {
        visible: createDialogOpen; entity: selectedEntity
        fields: Crud.buildFormFields(entityFields, entityColumns, selectedEntity, editingRecord, false)
        isEdit: false
        onSave: function(data) {
            var newRec = { id: Crud.generateId(idPrefixes, selectedEntity, records) };
            var fieldKeys = entityFields[selectedEntity];
            for (var f = 1; f < fieldKeys.length; f++) newRec[fieldKeys[f]] = data[fieldKeys[f]] || "";
            if (!newRec.status) newRec.status = "Active";
            if (useLiveData) {
                dbal.create(selectedEntity, newRec, function(result, error) { if (!error) loadEntityData(); else addRecord(newRec); });
            } else { addRecord(newRec); }
            createDialogOpen = false;
        }
        onCancel: createDialogOpen = false
    }

    // ── Edit dialog ──────────────────────────────────────────────
    CEntityForm {
        visible: editDialogOpen; entity: selectedEntity
        fields: Crud.buildFormFields(entityFields, entityColumns, selectedEntity, editingRecord, true)
        isEdit: true; editId: editingRecord.id || ""
        onSave: function(data) {
            var updatedRec = { id: editingRecord.id };
            var fieldKeys = entityFields[selectedEntity];
            for (var f = 1; f < fieldKeys.length; f++) updatedRec[fieldKeys[f]] = data[fieldKeys[f]] || editingRecord[fieldKeys[f]] || "";
            if (useLiveData) {
                dbal.update(selectedEntity, editingRecord.id, updatedRec, function(result, error) { if (!error) loadEntityData(); else updateRecord(updatedRec); });
            } else { updateRecord(updatedRec); }
            editDialogOpen = false;
        }
        onCancel: editDialogOpen = false
    }

    // ── Delete confirmation dialog ───────────────────────────────
    CDeleteRecordDialog {
        visible: deleteDialogOpen
        entity: selectedEntity
        recordId: { var rec = getPagedRecords()[editingIndex]; return rec ? rec.id : ""; }
        useLiveData: root.useLiveData
        onConfirmed: {
            if (useLiveData) {
                var rec = getPagedRecords()[editingIndex];
                if (rec) dbal.remove(selectedEntity, rec.id, function(result, error) { if (!error) loadEntityData(); else deleteRecord(editingIndex); });
            } else { deleteRecord(editingIndex); }
            deleteDialogOpen = false;
        }
        onCancelled: deleteDialogOpen = false
    }
}

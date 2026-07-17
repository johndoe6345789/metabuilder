import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "qmllib/dbal"; import "qmllib/MetaBuilder"
import "AdminCrud.js" as Crud
Rectangle {
    id: root; color: Theme.background
    objectName: "view_admin"
    Accessible.role: Accessible.Pane
    Accessible.name: "Admin View"
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected; property bool configLoaded: false
    property string selEnt: "User"
    property string searchText: ""
    property string activeFilter: "All"
    property int curPage: 0; property int pgSize: 5; property int selRow: -1
    property var selRows: ({}); property bool selectAll: false
    property int editIdx: -1; property var editRec: ({})
    property var entities: []
    property var entIcons: ({})
    property var entCols: ({})
    property var entFlds: ({})
    property var idPfx: ({})
    property var records: ({})
    function fil() {
        return Crud.filterRecords(
            records[selEnt] || [],
            activeFilter, searchText,
            entFlds[selEnt] || []) }
    function pg() {
        return fil().slice(curPage * pgSize,
            (curPage + 1) * pgSize) }
    function hasSel() {
        for (var k in selRows)
            if (selRows[k]) return true
        return false }
    function loadData() {
        if (!useLiveData) return
        dbal.list(selEnt,
            { take: pgSize,
              skip: curPage * pgSize },
            function(res, err) {
            if (err || !res) return
            records = Crud.replaceEntity(records, selEnt,
                Crud.parseLiveData(res.items || [], entFlds[selEnt] || [])) }) }
    Component.onCompleted: {
        Crud.loadJson("config/admin-entities.json", function(d) {
            if (!d) return
            entities = d.entities || []
            entIcons = d.icons || ({})
            entCols = d.columns || ({})
            entFlds = d.fields || ({})
            idPfx = d.idPrefixes || ({})
            configLoaded = true })
        Crud.loadJson(
            "config/admin-mock-data.json",
            function(d) {
                if (!useLiveData && d) records = d })
        if (useLiveData) loadData() }
    onUseLiveDataChanged: if (useLiveData) loadData()
    onSelEntChanged: {
        curPage = 0; selRow = -1; selRows = {}; selectAll = false
        searchText = ""; activeFilter = "All"; if (useLiveData) loadData() }
    ColumnLayout {
        anchors.fill: parent; spacing: 0; visible: configLoaded
        CAdminStatsBar { stats: Crud.adminStats(records) }
        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0
            CEntitySidebar {
                entities: root.entities
                entityIcons: root.entIcons
                selectedEntity: root.selEnt
                entityCounts: Crud.entityCounts(root.entities, records)
                onEntitySelected: function(n) { root.selEnt = n } }
            CAdminContentPanel {
                Layout.fillWidth: true
                Layout.fillHeight: true
                adminRoot: root
                adminDlg: dlg } } }
    CAdminDialogs {
        id: dlg; selectedEntity: root.selEnt; useLiveData: root.useLiveData
        fields: dlg.editDialogOpen
            ? Crud.buildFormFields(entFlds, entCols, selEnt, editRec, true)
            : Crud.buildFormFields(entFlds, entCols, selEnt, editRec, false)
        editId: editRec.id || ""
        deleteRecordId: { var r = pg()[editIdx]; return r ? r.id : "" }
        onCreateSaved: function(data) { Crud.doCreate(root, dbal, dlg, data) }
        onEditSaved: function(data) { Crud.doEdit(root, dbal, dlg, data) }
        onCreateCancelled: dlg.createDialogOpen = false
        onEditCancelled: dlg.editDialogOpen = false
        onDeleteConfirmed: Crud.doDelete(root, dbal, dlg)
        onDeleteCancelled: dlg.deleteDialogOpen = false
    }
}

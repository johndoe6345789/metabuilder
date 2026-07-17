import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "../../AdminCrud.js" as Crud
Rectangle {
    id: panel; color: Theme.background
    objectName: "panel_admin_content"
    Accessible.role: Accessible.Pane
    Accessible.name: "Admin Content Panel"
    property var adminRoot
    property var adminDlg
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16; spacing: 12
        CAdminToolbar {
            Layout.fillWidth: true
            selectedEntity: adminRoot.selEnt
            searchText: adminRoot.searchText
            activeFilter: adminRoot.activeFilter
            entityIcons: adminRoot.entIcons
            useLiveData: adminRoot.useLiveData
            hasSelectedRows: adminRoot.hasSel()
            onSearchChanged: function(t) {
                adminRoot.searchText = t
                adminRoot.curPage = 0 }
            onFilterChanged: function(f) {
                adminRoot.activeFilter = f
                adminRoot.curPage = 0 }
            onCreateClicked: {
                adminRoot.editRec = {}
                adminDlg.createDialogOpen = true }
            onDeleteSelectedClicked: {
                adminRoot.records =
                    Crud.deleteSelectedRows(
                        adminRoot.records,
                        adminRoot.selEnt,
                        adminRoot.selRows,
                        adminRoot.pg())
                adminRoot.selRows = {}
                adminRoot.selectAll = false
                adminRoot.selRow = -1
                adminRoot.curPage =
                    Crud.clampPage(
                        adminRoot.curPage,
                        Math.max(1,
                            Math.ceil(
                                adminRoot.fil()
                                    .length
                                / adminRoot.pgSize
                            ))) }
        }
        CDataTable {
            headers:
                adminRoot.entCols[
                    adminRoot.selEnt] || []
            fields:
                adminRoot.entFlds[
                    adminRoot.selEnt] || []
            rows: adminRoot.pg()
            totalFiltered:
                adminRoot.fil().length
            page: adminRoot.curPage
            pageSize: adminRoot.pgSize
            selectedRow: adminRoot.selRow
            selectedRows: adminRoot.selRows
            selectAll: adminRoot.selectAll
            onRowClicked: function(i) {
                adminRoot.selRow = i }
            onPageRequested: function(p) {
                adminRoot.curPage = p }
            onRowSelectionChanged:
                function(s) {
                    adminRoot.selRows = s }
            onSelectAllChanged:
                function(c) {
                    adminRoot.selectAll = c }
            onEditClicked: function(i, r) {
                adminRoot.editIdx = i
                adminRoot.editRec =
                    Object.assign({}, r)
                adminDlg.editDialogOpen = true }
            onDeleteClicked: function(i) {
                adminRoot.editIdx = i
                adminDlg.deleteDialogOpen =
                    true }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CDataTable.qml - Generic data table with checkboxes, pagination, search,
 // actions
 */
CCard {
    id: root
    objectName: "table_data"
    Accessible.role: Accessible.Table
    Accessible.name: "Data Table"

    property var headers: []
    property var fields: []
    property var rows: []
    property int totalFiltered: 0
    property int page: 0
    property int pageSize: 5
    property int selectedRow: -1
    property var selectedRows: ({})
    property bool selectAll: false
    property bool isDark: Theme.mode === "dark"

    signal rowClicked(int index)
    signal editClicked(int index, var record)
    signal deleteClicked(int index, var record)
    signal pageRequested(int newPage)
    signal selectAllToggled(bool checked)
    signal rowSelectionChanged(var selectedRows)

    Layout.fillWidth: true
    Layout.fillHeight: true

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 0

        CTableHeader {
            headers: root.headers
            selectAll: root.selectAll
            onSelectAllToggled: function(checked) {
                root.selectAll = checked;
                var newSel = {};
                for (var i = 0; i < root.rows.length; i++) newSel[i] = checked;
                root.selectedRows = newSel;
                root.rowSelectionChanged(newSel);
                root.selectAllToggled(checked);
            }
        }

        CDivider { Layout.fillWidth: true }

        ListView {
            id: tableView
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.rows
            clip: true
            spacing: 0

            delegate: CTableRowDelegate {
                rowData: modelData
                rowIndex: index
                fields: root.fields
                isSelected: root.selectedRow === index
                isChecked:
                    root.selectedRows[index] || false
                tableWidth: tableView.width
                activeFocusOnTab: true
                Accessible.role: Accessible.Row
                Accessible.name: "Row " + (index + 1)
                Accessible.description:
                    "Table row " + (index + 1)
                    + " of " + root.totalFiltered
                Keys.onReturnPressed:
                    root.rowClicked(rowIndex)
                Keys.onSpacePressed:
                    root.rowClicked(rowIndex)
                onClicked: root.rowClicked(rowIndex)
                onCheckChanged: function(checked) {
                    var newSel = Object.assign(
                        {}, root.selectedRows);
                    newSel[rowIndex] = checked;
                    root.selectedRows = newSel;
                    root.rowSelectionChanged(newSel);
                }
                onEditClicked: function(idx, record) {
                    root.editClicked(idx, record)
                }
                onDeleteClicked: function(idx, record) {
                    root.deleteClicked(idx, record)
                }
            }
        }

        CTableEmptyState {
            visible: root.totalFiltered === 0
            Layout.fillHeight: root.totalFiltered === 0
            Layout.preferredHeight: visible ? 120 : 0
        }

        CDivider { Layout.fillWidth: true }

        CTablePagination {
            page: root.page
            pageSize: root.pageSize
            totalFiltered: root.totalFiltered
            onPageRequested: function(newPage) { root.pageRequested(newPage) }
        }
    }
}

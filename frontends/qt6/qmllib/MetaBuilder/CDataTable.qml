import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CDataTable.qml - Generic data table with checkboxes, pagination, search, actions
 *
 * Usage:
 *   CDataTable {
 *       headers: ["ID", "Username", "Email", "Role", "Status", "Created"]
 *       fields: ["id", "username", "email", "role", "status", "created"]
 *       rows: [{ id: "USR-001", username: "admin", ... }]
 *       totalFiltered: 24
 *       page: 0
 *       pageSize: 5
 *       onRowClicked: function(index) { ... }
 *       onEditClicked: function(index, record) { ... }
 *       onDeleteClicked: function(index, record) { ... }
 *   }
 */
CCard {
    id: root

    property var headers: []       // Column header labels
    property var fields: []        // Field keys matching headers
    property var rows: []          // Array of record objects (current page)
    property int totalFiltered: 0  // Total filtered count (for pagination text)
    property int page: 0           // Current page index
    property int pageSize: 5
    property int selectedRow: -1
    property var selectedRows: ({})
    property bool selectAll: false
    property bool isDark: Theme.mode === "dark"

    signal rowClicked(int index)
    signal editClicked(int index, var record)
    signal deleteClicked(int index, var record)
    signal pageRequested(int newPage)
    signal selectAllChanged(bool checked)
    signal rowSelectionChanged(var selectedRows)

    Layout.fillWidth: true
    Layout.fillHeight: true

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 0

        // ── Column headers ──────────────────────────────────────
        CTableHeader {
            headers: root.headers
            selectAll: root.selectAll
            onSelectAllToggled: function(checked) {
                root.selectAll = checked;
                var newSel = {};
                for (var i = 0; i < root.rows.length; i++) {
                    newSel[i] = checked;
                }
                root.selectedRows = newSel;
                root.rowSelectionChanged(newSel);
                root.selectAllChanged(checked);
            }
        }

        CDivider { Layout.fillWidth: true }

        // ── Data rows ───────────────────────────────────────────
        ListView {
            id: tableView
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.rows
            clip: true
            spacing: 0

            delegate: Rectangle {
                id: rowDelegate
                width: tableView.width
                height: 48
                property var rowData: modelData
                property int rowIndex: index
                color: {
                    if (root.selectedRow === rowIndex) return Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12);
                    if (root.selectedRows[rowIndex]) return Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.06);
                    return rowIndex % 2 === 0 ? "transparent" : Theme.surfaceVariant;
                }
                radius: 0

                MouseArea {
                    anchors.fill: parent
                    onClicked: root.rowClicked(rowDelegate.rowIndex)
                }

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 0

                    CheckBox {
                        Layout.preferredWidth: 36
                        checked: root.selectedRows[rowDelegate.rowIndex] || false
                        onCheckedChanged: {
                            var newSel = Object.assign({}, root.selectedRows);
                            newSel[rowDelegate.rowIndex] = checked;
                            root.selectedRows = newSel;
                            root.rowSelectionChanged(newSel);
                        }
                    }

                    Repeater {
                        model: root.fields
                        delegate: Item {
                            Layout.fillWidth: index > 0
                            Layout.preferredWidth: index === 0 ? 80 : -1
                            implicitHeight: 48

                            CText {
                                anchors.verticalCenter: parent.verticalCenter
                                anchors.left: parent.left
                                anchors.right: parent.right
                                variant: "body2"
                                text: {
                                    var key = modelData;
                                    var rec = rowDelegate.rowData;
                                    return rec ? (String(rec[key] || "")) : "";
                                }
                                elide: Text.ElideRight
                            }
                        }
                    }

                    FlexRow {
                        Layout.preferredWidth: 110
                        Layout.alignment: Qt.AlignRight
                        spacing: 4
                        CButton {
                            text: "Edit"
                            variant: "ghost"
                            size: "sm"
                            onClicked: root.editClicked(rowDelegate.rowIndex, rowDelegate.rowData)
                        }
                        CButton {
                            text: "Del"
                            variant: "danger"
                            size: "sm"
                            onClicked: root.deleteClicked(rowDelegate.rowIndex, rowDelegate.rowData)
                        }
                    }
                }
            }
        }

        // ── Empty state ─────────────────────────────────────────
        Item {
            Layout.fillWidth: true
            Layout.fillHeight: root.totalFiltered === 0
            visible: root.totalFiltered === 0
            Layout.preferredHeight: visible ? 120 : 0

            ColumnLayout {
                anchors.centerIn: parent
                spacing: 8

                CText {
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                    variant: "h4"
                    text: "No records found"
                    color: Theme.textSecondary
                }
                CText {
                    Layout.fillWidth: true
                    horizontalAlignment: Text.AlignHCenter
                    variant: "caption"
                    text: "Try adjusting your search or filter criteria."
                    color: Theme.textMuted
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        // ── Pagination footer ───────────────────────────────────
        CTablePagination {
            page: root.page
            pageSize: root.pageSize
            totalFiltered: root.totalFiltered
            onPageChanged: function(newPage) { root.pageRequested(newPage) }
        }
    }
}

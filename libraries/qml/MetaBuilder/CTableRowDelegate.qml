import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CTableRowDelegate.qml - Row delegate for CDataTable
 *
 * Usage:
 *   CTableRowDelegate {
 *       rowData: { id: "USR-001", username: "admin" }
 *       rowIndex: 0
 *       fields: ["id", "username", "email"]
 *       isSelected: false
 *       isChecked: false
 *       tableWidth: 800
 *   }
 */
Rectangle {
    id: rowDel

    property var rowData: ({})
    property int rowIndex: 0
    property var fields: []
    property bool isSelected: false
    property bool isChecked: false
    property real tableWidth: 400

    signal clicked()
    signal checkChanged(bool checked)
    signal editClicked(int index, var record)
    signal deleteClicked(int index, var record)

    width: tableWidth
    height: 48
    color: {
        if (isSelected) return
            Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12);
        if (isChecked) return
            Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.06);
        return rowIndex % 2 === 0 ? "transparent" : Theme.surfaceVariant;
    }
    radius: 0

    MouseArea {
        anchors.fill: parent
        onClicked: rowDel.clicked()
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 0

        CheckBox {
            Layout.preferredWidth: 36
            checked: rowDel.isChecked
            onCheckedChanged: rowDel.checkChanged(checked)
        }

        Repeater {
            model: rowDel.fields
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
                        var rec = rowDel.rowData;
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
                onClicked: rowDel.editClicked(rowDel.rowIndex, rowDel.rowData)
            }
            CButton {
                text: "Del"
                variant: "danger"
                size: "sm"
                onClicked: rowDel.deleteClicked(rowDel.rowIndex, rowDel.rowData)
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: root
    objectName: "dialog_delete_confirm"

    property string itemName: ""
    property string description: "This action cannot be undone."

    signal confirmed()

    title: "Confirm Delete"

    ColumnLayout {
        spacing: 16
        width: 320

        CAlert {
            Layout.fillWidth: true
            severity: "warning"
            text: itemName.length > 0
                  ? "Are you sure you want to delete \"" + itemName + "\"?"
                  : "No item selected."
        }

        CText {
            variant: "body2"
            text: root.description
            wrapMode: Text.WordWrap
            Layout.fillWidth: true
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CButton {
                text: "Cancel"
                variant: "ghost"
                Accessible.role: Accessible.Button
                Accessible.name: "Cancel"
                Accessible.description:
                    "Close without deleting"
                Keys.onReturnPressed:
                    root.visible = false
                Keys.onSpacePressed:
                    root.visible = false
                onClicked: root.visible = false
            }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Delete"
                variant: "danger"
                Accessible.role: Accessible.Button
                Accessible.name: "Confirm delete"
                Accessible.description:
                    "Permanently delete this item"
                Keys.onReturnPressed: {
                    root.confirmed()
                    root.visible = false
                }
                Keys.onSpacePressed: {
                    root.confirmed()
                    root.visible = false
                }
                onClicked: {
                    root.confirmed()
                    root.visible = false
                }
            }
        }
    }
}

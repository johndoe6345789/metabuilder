import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: root
    objectName: "dialog_delete_dropdown"
    title: "Delete Dropdown"

    property var dropdown: null

    signal confirmed()
    signal cancelled()

    ColumnLayout {
        spacing: 16; width: 400
        CAlert {
            severity: "warning"
            text: "This action cannot be " +
                "undone. Any forms " +
                "referencing this dropdown " +
                "will need to be updated."
            Layout.fillWidth: true
        }
        CText {
            variant: "body1"
            text: root.dropdown
                ? "Are you sure you want to " +
                  "delete \"" +
                  root.dropdown.name +
                  "\" with " +
                  root.dropdown.options.length +
                  " options?"
                : ""
            wrapMode: Text.WordWrap
        }
        FlexRow {
            Layout.fillWidth: true
            spacing: 8
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"
                variant: "ghost"
                Accessible.role: Accessible.Button
                Accessible.name: "Cancel"
                Keys.onReturnPressed:
                    root.cancelled()
                Keys.onSpacePressed:
                    root.cancelled()
                onClicked: root.cancelled()
            }
            CButton {
                text: "Delete"
                variant: "danger"
                Accessible.role: Accessible.Button
                Accessible.name: "Confirm delete"
                Accessible.description:
                    "Permanently delete this " +
                    "dropdown"
                Keys.onReturnPressed:
                    root.confirmed()
                Keys.onSpacePressed:
                    root.confirmed()
                onClicked: root.confirmed()
            }
        }
    }
}

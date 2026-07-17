import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: addDropdownDialog
    objectName: "dialog_add_dropdown"
    title: "Add New Dropdown"

    property string dropdownName: ""
    property string dropdownDescription: ""

    signal createRequested(
        string name, string description
    )
    signal cancelled()

    ColumnLayout {
        spacing: 16
        width: 400
        CText {
            variant: "body2"
            text: "Create a new dropdown "
                + "configuration. The name "
                + "will be normalized to "
                + "snake_case."
        }
        CTextField {
            label: "Dropdown Name"
            placeholderText:
                "e.g. ticket_types"
            text: dropdownName
            Layout.fillWidth: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Dropdown Name"
            Accessible.description:
                "Enter a name; it will be " +
                "normalized to snake_case"
            onTextChanged:
                addDropdownDialog
                    .dropdownName = text
        }
        CTextField {
            label: "Description"
            placeholderText: "What will this "
                + "dropdown be used for?"
            text: dropdownDescription
            Layout.fillWidth: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Description"
            Accessible.description:
                "Optional description of " +
                "what this dropdown is for"
            onTextChanged:
                addDropdownDialog
                    .dropdownDescription = text
        }
        CAlert {
            severity: "info"
            text: "A default option will "
                + "be added. You can "
                + "configure options "
                + "after creation."
            Layout.fillWidth: true
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
                Accessible.description:
                    "Dismiss this dialog without " +
                    "creating a dropdown"
                Keys.onReturnPressed: {
                    addDropdownDialog
                        .dropdownName = ""
                    addDropdownDialog
                        .dropdownDescription = ""
                    cancelled()
                }
                Keys.onSpacePressed: {
                    addDropdownDialog
                        .dropdownName = ""
                    addDropdownDialog
                        .dropdownDescription = ""
                    cancelled()
                }
                onClicked: {
                    addDropdownDialog
                        .dropdownName = ""
                    addDropdownDialog
                        .dropdownDescription = ""
                    cancelled()
                }
            }
            CButton {
                text: "Create"
                variant: "primary"
                enabled:
                    dropdownName.trim() !== ""
                Accessible.role: Accessible.Button
                Accessible.name: "Create dropdown"
                Accessible.description:
                    "Create the new dropdown " +
                    "configuration"
                Keys.onReturnPressed: {
                    if (!enabled) return
                    createRequested(
                        dropdownName,
                        dropdownDescription)
                    addDropdownDialog
                        .dropdownName = ""
                    addDropdownDialog
                        .dropdownDescription = ""
                }
                Keys.onSpacePressed: {
                    if (!enabled) return
                    createRequested(
                        dropdownName,
                        dropdownDescription)
                    addDropdownDialog
                        .dropdownName = ""
                    addDropdownDialog
                        .dropdownDescription = ""
                }
                onClicked: {
                    createRequested(
                        dropdownName,
                        dropdownDescription)
                    addDropdownDialog
                        .dropdownName = ""
                    addDropdownDialog
                        .dropdownDescription = ""
                }
            }
        }
    }
}

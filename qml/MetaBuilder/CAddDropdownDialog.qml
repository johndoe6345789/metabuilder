import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: addDropdownDialog
    title: "Add New Dropdown"

    property string dropdownName: ""
    property string dropdownDescription: ""

    signal createRequested(string name, string description)
    signal cancelled()

    ColumnLayout {
        spacing: 16; width: 400
        CText { variant: "body2"; text: "Create a new dropdown configuration. The name will be normalized to snake_case." }
        CTextField { label: "Dropdown Name"; placeholderText: "e.g. ticket_types"; text: dropdownName; Layout.fillWidth: true; onTextChanged: addDropdownDialog.dropdownName = text }
        CTextField { label: "Description"; placeholderText: "What will this dropdown be used for?"; text: dropdownDescription; Layout.fillWidth: true; onTextChanged: addDropdownDialog.dropdownDescription = text }
        CAlert { severity: "info"; text: "A default option will be added. You can configure options after creation."; Layout.fillWidth: true }
        FlexRow {
            Layout.fillWidth: true; spacing: 8; Item { Layout.fillWidth: true }
            CButton { text: "Cancel"; variant: "ghost"; onClicked: { addDropdownDialog.dropdownName = ""; addDropdownDialog.dropdownDescription = ""; cancelled() } }
            CButton { text: "Create"; variant: "primary"; enabled: dropdownName.trim() !== ""; onClicked: { createRequested(dropdownName, dropdownDescription); addDropdownDialog.dropdownName = ""; addDropdownDialog.dropdownDescription = "" } }
        }
    }
}

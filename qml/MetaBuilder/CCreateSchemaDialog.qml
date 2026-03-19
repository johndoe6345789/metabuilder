import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: dlg
    title: "Create New Schema"
    property string schemaName: ""
    property string schemaDescription: ""
    signal createRequested(
        string name, string description)
    signal cancelled()
    ColumnLayout {
        spacing: 16; width: 360
        CTextField {
            label: "Schema Name"
            placeholderText: "e.g. Invoice"
            text: dlg.schemaName
            Layout.fillWidth: true
            onTextChanged:
                dlg.schemaName = text
        }
        CTextField {
            label: "Description"
            placeholderText: "Brief description"
                + " of this schema"
            text: dlg.schemaDescription
            Layout.fillWidth: true
            onTextChanged:
                dlg.schemaDescription = text
        }
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"
                variant: "ghost"
                onClicked: {
                    dlg.schemaName = ""
                    dlg.schemaDescription = ""
                    cancelled()
                }
            }
            CButton {
                text: "Create"
                variant: "primary"
                enabled:
                    dlg.schemaName.trim() !== ""
                onClicked: {
                    createRequested(
                        dlg.schemaName,
                        dlg.schemaDescription)
                    dlg.schemaName = ""
                    dlg.schemaDescription = ""
                }
            }
        }
    }
}

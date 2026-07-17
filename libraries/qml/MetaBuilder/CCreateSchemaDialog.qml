import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: dlg
    objectName: "dialog_create_schema"
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
            Accessible.role: Accessible.EditableText
            Accessible.name: "Schema Name"
            onTextChanged:
                dlg.schemaName = text
        }
        CTextField {
            label: "Description"
            placeholderText: "Brief description"
                + " of this schema"
            text: dlg.schemaDescription
            Layout.fillWidth: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Schema Description"
            onTextChanged:
                dlg.schemaDescription = text
        }
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"
                variant: "ghost"
                Accessible.role: Accessible.Button
                Accessible.name: "Cancel"
                Keys.onReturnPressed: {
                    dlg.schemaName = ""
                    dlg.schemaDescription = ""
                    cancelled()
                }
                Keys.onSpacePressed: {
                    dlg.schemaName = ""
                    dlg.schemaDescription = ""
                    cancelled()
                }
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
                Accessible.role: Accessible.Button
                Accessible.name: "Create schema"
                Keys.onReturnPressed: {
                    if (!enabled) return
                    createRequested(
                        dlg.schemaName,
                        dlg.schemaDescription)
                    dlg.schemaName = ""
                    dlg.schemaDescription = ""
                }
                Keys.onSpacePressed: {
                    if (!enabled) return
                    createRequested(
                        dlg.schemaName,
                        dlg.schemaDescription)
                    dlg.schemaName = ""
                    dlg.schemaDescription = ""
                }
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

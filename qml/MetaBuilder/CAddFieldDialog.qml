import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: dlg
    title: "Add New Field"
    property var fieldTypes: []
    property string fieldName: ""
    property string fieldType: "string"
    property bool fieldRequired: false
    property string fieldDefault: ""
    property string fieldDescription: ""
    signal fieldAdded(var fieldData)
    signal cancelled()
    function reset() {
        fieldName = ""; fieldType = "string"
        fieldRequired = false
        fieldDefault = ""; fieldDescription = ""
    }
    ColumnLayout {
        spacing: 14; width: 360
        CTextField {
            label: "Field Name"
            placeholderText: "e.g. quantity"
            text: dlg.fieldName
            Layout.fillWidth: true
            onTextChanged: dlg.fieldName = text
        }
        ColumnLayout {
            Layout.fillWidth: true; spacing: 4
            CText {
                variant: "caption"; text: "Type"
            }
            CSelect {
                model: dlg.fieldTypes
                currentIndex:
                    dlg.fieldTypes.indexOf(
                        dlg.fieldType)
                Layout.fillWidth: true
                onCurrentIndexChanged:
                    dlg.fieldType =
                        dlg.fieldTypes[currentIndex]
            }
        }
        CSwitch {
            text: "Required"
            checked: dlg.fieldRequired
            onCheckedChanged:
                dlg.fieldRequired = checked
        }
        CTextField {
            label: "Default Value"
            placeholderText: "Optional default"
            text: dlg.fieldDefault
            Layout.fillWidth: true
            onTextChanged:
                dlg.fieldDefault = text
        }
        CTextField {
            label: "Description"
            placeholderText:
                "What this field represents"
            text: dlg.fieldDescription
            Layout.fillWidth: true
            onTextChanged:
                dlg.fieldDescription = text
        }
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            Item { Layout.fillWidth: true }
            CButton {
                text: "Cancel"
                variant: "ghost"
                onClicked: { reset(); cancelled() }
            }
            CButton {
                text: "Add Field"
                variant: "primary"
                enabled:
                    dlg.fieldName.trim() !== ""
                onClicked: {
                    fieldAdded({
                        name: fieldName,
                        type: fieldType,
                        required: fieldRequired,
                        defaultValue: fieldDefault,
                        description: fieldDescription
                    })
                    reset()
                }
            }
        }
    }
}

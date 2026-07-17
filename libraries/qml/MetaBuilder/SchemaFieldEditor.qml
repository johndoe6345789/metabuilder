import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var field: null
    property var fieldTypes: []

    signal fieldUpdated(string key, var value)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 14

        CText { variant: "subtitle1"; text: "Field Editor" }
        CDivider { Layout.fillWidth: true }

        CTextField {
            label: "Field Name"
            placeholderText: "e.g. username"
            text: root.field ? root.field.name : ""
            Layout.fillWidth: true
            onTextChanged: {
                if (root.field && text !== root.field.name)
                    root.fieldUpdated("name", text)
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Type" }
            CSelect {
                model: root.fieldTypes
                currentIndex: {
                    if (!root.field) return 0
                    var idx = root.fieldTypes.indexOf(root.field.type)
                    return idx >= 0 ? idx : 0
                }
                Layout.fillWidth: true
                onCurrentIndexChanged: {
                    if (root.field &&
                        root.fieldTypes[currentIndex] !== root.field.type)
                        root.fieldUpdated("type", root.fieldTypes[currentIndex])
                }
            }
        }

        CSwitch {
            text: "Required"
            checked: root.field ? root.field.required : false
            onCheckedChanged: {
                if (root.field && checked !== root.field.required)
                    root.fieldUpdated("required", checked)
            }
        }

        CTextField {
            label: "Default Value"
            placeholderText: "e.g. uuid()"
            text: root.field ? root.field.defaultValue : ""
            Layout.fillWidth: true
            onTextChanged: {
                if (root.field && text !== root.field.defaultValue)
                    root.fieldUpdated("defaultValue", text)
            }
        }

        CTextField {
            label: "Description"
            placeholderText: "Field description"
            text: root.field ? root.field.description : ""
            Layout.fillWidth: true
            onTextChanged: {
                if (root.field && text !== root.field.description)
                    root.fieldUpdated("description", text)
            }
        }

        Item { Layout.fillHeight: true }

        CAlert {
            severity: "info"
            text: "Editing: " + (root.field ? root.field.name : "")
            Layout.fillWidth: true
        }
    }
}

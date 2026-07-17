import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: propsPanel
    objectName: "luaPropertiesPanel"
    Accessible.role: Accessible.Pane
    Accessible.name: "Lua script properties"
    Layout.preferredWidth: 260
    Layout.fillHeight: true
    color: Theme.paper
    border.color: Theme.border
    border.width: 1

    property string scriptName: ""
    property string scriptDescription: ""
    property string returnType: ""
    property var params: []
    property string currentCode: ""

    signal nameChanged(string name)
    signal descriptionChanged(string desc)
    signal returnTypeEdited(string rt)
    signal paramAdded()

    ScrollView {
        anchors.fill: parent
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 12

            Item { Layout.preferredHeight: 4 }

            ColumnLayout {
                Layout.leftMargin: 14
                Layout.rightMargin: 14
                spacing: 12

                CText { variant: "h4"; text: "Properties" }

                CDivider { Layout.fillWidth: true }

                CTextField {
                    Layout.fillWidth: true
                    label: "SCRIPT NAME"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Script name"
                    text: scriptName
                    onTextChanged: nameChanged(text)
                }
                CTextField {
                    Layout.fillWidth: true
                    label: "DESCRIPTION"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Script description"
                    text: scriptDescription
                    onTextChanged: descriptionChanged(text)
                }
                CTextField {
                    Layout.fillWidth: true
                    label: "RETURN TYPE"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Return type"
                    text: returnType
                    onTextChanged: returnTypeEdited(text)
                }

                CDivider { Layout.fillWidth: true }

                FlexRow {
                    Layout.fillWidth: true
                    CText { variant: "h4"; text: "Parameters" }
                    Item { Layout.fillWidth: true }
                    CBadge { text: params.length.toString() }
                }

                // Parameter list
                Repeater {
                    model: params.length
                    delegate: ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 6
                            CChip { text: params[index].type }
                            CText { variant: "body2"; text: params[index].name }
                        }

                        CDivider { Layout.fillWidth: true }
                    }
                }

                CButton {
                    text: "Add Parameter"
                    variant: "ghost"
                    Layout.fillWidth: true
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Add parameter"
                    Accessible.description:
                        "Add a new parameter to the script"
                    Keys.onReturnPressed: paramAdded()
                    Keys.onSpacePressed: paramAdded()
                    onClicked: paramAdded()
                }

                LuaScriptInfoSection { currentCode: propsPanel.currentCode }
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}

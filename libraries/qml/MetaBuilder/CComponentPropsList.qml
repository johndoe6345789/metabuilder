import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "list_component_props"
    Accessible.role: Accessible.List
    Accessible.name: "Custom Properties"
    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 8

    property var props: []

    signal addProp()
    signal removeProp(int index)

    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        CText { variant: "h4"; text: "Custom Properties" }
        Item { Layout.fillWidth: true }
        CButton {
            text: "Add Prop"
            variant: "ghost"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Add custom property"
            Keys.onReturnPressed: root.addProp()
            Keys.onSpacePressed: root.addProp()
            onClicked: root.addProp()
        }
    }

    ListView {
        Layout.fillWidth: true
        Layout.fillHeight: true
        clip: true
        spacing: 6
        model: root.props

        delegate: CPaper {
            width: parent ? parent.width : 300
            height: 44

            RowLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 8

                CText {
                    variant: "body2"
                    text: modelData.key
                    Layout.preferredWidth: 120
                    opacity: 0.7
                }

                CText {
                    variant: "body1"
                    text: modelData.value
                    Layout.fillWidth: true
                }

                CButton {
                    text: "\u00D7"
                    variant: "ghost"
                    size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name:
                        "Remove property "
                        + modelData.key
                    Keys.onReturnPressed:
                        root.removeProp(index)
                    Keys.onSpacePressed:
                        root.removeProp(index)
                    onClicked: root.removeProp(index)
                }
            }
        }
    }
}

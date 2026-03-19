import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

FlexRow {
    id: root
    objectName: "legend_component_type"
    Accessible.role: Accessible.Pane
    Accessible.name: "Component Type Legend"
    Layout.fillWidth: true
    spacing: 6

    Repeater {
        model: [
            { label: "container", color: "#5C6BC0" },
            { label: "layout",    color: "#26A69A" },
            { label: "widget",    color: "#FFA726" },
            { label: "atom",      color: "#EF5350" }
        ]
        delegate: Row {
            spacing: 4
            Accessible.role: Accessible.StaticText
            Accessible.name: modelData.label
                + " component type"
            Rectangle {
                width: 10; height: 10; radius: 2
                color: modelData.color
                anchors.verticalCenter:
                    parent.verticalCenter
            }
            CText {
                variant: "caption"
                text: modelData.label
            }
        }
    }
}

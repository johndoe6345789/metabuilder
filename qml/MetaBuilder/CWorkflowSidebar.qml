import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var workflows: []
    property int selectedWorkflowIndex: -1

    signal workflowSelected(int index)
    signal nodeDoubleClicked(string nodeType, real canvasCenterX,
        real canvasCenterY)

    // Pass canvas dimensions so parent can compute center
    property real canvasWidth: 800
    property real canvasHeight: 600

    Layout.preferredWidth: 260
    Layout.fillHeight: true
    color: Theme.paper
    border.color: Theme.border
    border.width: 1

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Workflow List Section
        ColumnLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 200
            Layout.margins: 12
            spacing: 4

            CText { variant: "h4"; text: "Workflows" }
            CText { variant: "caption"; text: workflows.length + " registered" }

            CDivider { Layout.fillWidth: true; Layout.topMargin: 4
            Layout.bottomMargin: 4 }

            ListView {
                Layout.fillWidth: true
                Layout.fillHeight: true
                model: workflows.length
                spacing: 2
                clip: true
                delegate: CListItem {
                    width: parent ? parent.width : 200
                    title: workflows[index].name
                    subtitle: (workflows[index].nodes
                        ? workflows[index].nodes.length : 0) + " nodes"
                    selected: root.selectedWorkflowIndex === index
                    onClicked: root.workflowSelected(index)

                    CBadge {
                        anchors.right: parent.right
                        anchors.rightMargin: 8
                        anchors.verticalCenter: parent.verticalCenter
                        text: workflows[index].active ? "ON" : "OFF"
                        accent: workflows[index].active
                    }
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        // Node Palette Section
        CNodePalette {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.margins: 12

            onNodeDoubleClicked: function(nodeType) {
                var cx = root.canvasWidth / 2
                var cy = root.canvasHeight / 2
                root.nodeDoubleClicked(nodeType, cx, cy)
            }
        }
    }
}

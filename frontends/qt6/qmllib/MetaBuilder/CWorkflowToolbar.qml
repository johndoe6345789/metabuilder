import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var workflow: null
    property bool useLiveData: false
    property real zoom: 1.0
    property string executionStatus: ""
    property int nodeCount: 0
    property var tags: []

    signal newWorkflow()
    signal runTest()
    signal toggleActive(bool active)
    signal resetZoom()

    implicitHeight: 56
    color: Theme.paper
    border.color: Theme.border
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 12

        CText {
            variant: "h3"
            text: workflow ? workflow.name : "No Workflow"
        }

        CBadge {
            visible: workflow !== null
            text: workflow && workflow.active ? "Active" : "Inactive"
            accent: workflow ? workflow.active : false
        }

        CBadge {
            text: useLiveData ? "Live" : "Mock"
            color: useLiveData ? Theme.success : Theme.warning
        }

        Repeater {
            model: tags.length > 3 ? 3 : tags.length
            CChip {
                text: tags[index] ? tags[index].name : ""
                chipColor: Theme.border
            }
        }

        CBadge {
            visible: nodeCount > 0
            text: nodeCount + " nodes"
            color: Theme.border
        }

        Item { Layout.fillWidth: true }

        CText {
            variant: "caption"
            text: Math.round(zoom * 100) + "%"
        }

        CButton {
            text: "Fit"
            variant: "ghost"
            size: "sm"
            onClicked: root.resetZoom()
        }

        CSwitch {
            visible: workflow !== null
            checked: workflow ? workflow.active : false
            onCheckedChanged: {
                if (workflow && workflow.active !== checked) {
                    root.toggleActive(checked)
                }
            }
        }

        CButton {
            text: "New"
            variant: "ghost"
            onClicked: root.newWorkflow()
        }

        CButton {
            text: executionStatus === "running" ? "Running..." : "Run Test"
            variant: "primary"
            enabled: executionStatus !== "running" && workflow !== null
            onClicked: root.runTest()
        }
    }
}

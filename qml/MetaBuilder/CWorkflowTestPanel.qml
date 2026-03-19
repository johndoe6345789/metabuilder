import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property bool panelVisible: false
    property string executionStatus: ""
    property string testInput: '{"userId": "u-42", "email": "demo@example.com"}'
    property string testOutput: ""
    property bool canExecute: true

    signal toggleVisibility()
    signal executeRequested()

    Layout.fillWidth: true
    Layout.preferredHeight: panelVisible ? 220 : 36
    color: Theme.paper
    border.color: Theme.border
    border.width: 1
    clip: true

    Behavior on Layout.preferredHeight { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 8

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText {
                variant: "body2"
                text: "Test Execution"
                font.bold: true
            }

            Rectangle {
                width: 10; height: 10; radius: 5
                visible: executionStatus !== ""
                color: {
                    if (executionStatus === "running") return Theme.warning
                    if (executionStatus === "success") return Theme.success
                    return Theme.error
                }
            }
            CText {
                variant: "caption"
                visible: executionStatus !== ""
                text: {
                    if (executionStatus === "running") return "Running..."
                    if (executionStatus === "success") return "Passed"
                    return "Failed"
                }
            }

            Item { Layout.fillWidth: true }

            CButton {
                text: panelVisible ? "Hide" : "Show"
                variant: "ghost"
                size: "sm"
                onClicked: root.toggleVisibility()
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 12
            visible: panelVisible

            ColumnLayout {
                Layout.preferredWidth: 300
                Layout.fillHeight: true
                spacing: 6

                CText { variant: "caption"; text: "Test Input (JSON)" }
                CTextField {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    text: root.testInput
                    onTextChanged: root.testInput = text
                }
                CButton {
                    text: executionStatus === "running" ? "Executing..." : "Execute"
                    variant: "primary"
                    enabled: executionStatus !== "running" && canExecute
                    onClicked: root.executeRequested()
                }
            }

            ColumnLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 6

                CText { variant: "caption"; text: "Output Log" }
                Rectangle {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    color: Theme.surface
                    radius: 4
                    border.color: Theme.border
                    border.width: 1

                    ScrollView {
                        anchors.fill: parent
                        anchors.margins: 8

                        Text {
                            width: parent.width
                            text: root.testOutput
                            color: Theme.text
                            font.family: "monospace"
                            font.pixelSize: 11
                            wrapMode: Text.WrapAnywhere
                        }
                    }
                }
            }
        }
    }
}

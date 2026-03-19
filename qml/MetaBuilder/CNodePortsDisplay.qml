import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: portsDisplay
    spacing: 8

    property var node: null

    CText { variant: "body2"; text: "Ports"; font.bold: true }

    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        ColumnLayout {
            spacing: 4
            CText { variant: "caption"; text: "Inputs" }
            Repeater {
                model: portsDisplay.node ? (portsDisplay.node.inputs || []) : []
                CChip {
                    text: modelData.displayName || modelData.name
                    chipColor: Theme.primary
                }
            }
            CText {
                visible: !portsDisplay.node || !portsDisplay.node.inputs ||
                    portsDisplay.node.inputs.length === 0
                variant: "caption"
                text: "None"
                opacity: 0.5
            }
        }

        ColumnLayout {
            spacing: 4
            CText { variant: "caption"; text: "Outputs" }
            Repeater {
                model: portsDisplay.node
                    ? (portsDisplay.node.outputs || []) : []
                CChip {
                    text: modelData.displayName || modelData.name
                    chipColor: Theme.success
                }
            }
            CText {
                visible: !portsDisplay.node || !portsDisplay.node.outputs ||
                    portsDisplay.node.outputs.length === 0
                variant: "caption"
                text: "None"
                opacity: 0.5
            }
        }
    }
}

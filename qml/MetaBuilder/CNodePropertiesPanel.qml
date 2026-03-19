import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var node: null
    property bool isDark: false
    property var workflowVariables: ({})

    signal nameChanged(string name)
    signal parameterChanged(string key, string value)
    signal deleteRequested()
    signal closed()

    color: Theme.paper
    border.color: Theme.border
    border.width: node ? 1 : 0
    clip: true
    visible: node !== null

    Behavior on Layout.preferredWidth { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

    function groupColor(nodeType) {
        var prefix = nodeType ? nodeType.split(".")[0] : ""
        switch (prefix) {
            case "metabuilder": return Theme.success
            case "logic":       return Theme.warning
            case "transform":
            case "packagerepo": return "#FF9800"
            case "sdl":
            case "graphics":    return "#2196F3"
            case "integration": return "#9C27B0"
            case "io":          return "#00BCD4"
            default:            return Theme.primary
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12
        visible: root.node !== null

        // Header
        FlexRow {
            Layout.fillWidth: true
            spacing: 8
            CText { variant: "h4"; text: "Node Properties" }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Delete"
                variant: "danger"
                size: "sm"
                onClicked: root.deleteRequested()
            }
            CButton {
                text: "X"
                variant: "ghost"
                size: "sm"
                onClicked: root.closed()
            }
        }

        CDivider { Layout.fillWidth: true }

        // Type badge
        FlexRow {
            Layout.fillWidth: true
            spacing: 8
            CText { variant: "body2"; text: "Type" }
            CChip {
                text: root.node ? root.node.type : ""
                chipColor: root.node ? groupColor(root.node.type) : Theme.primary
            }
        }

        // Name field
        CText { variant: "body2"; text: "Name" }
        CTextField {
            Layout.fillWidth: true
            text: root.node ? root.node.name : ""
            onTextChanged: {
                if (root.node && text !== root.node.name) {
                    root.nameChanged(text)
                }
            }
        }

        // Position display
        CText { variant: "body2"; text: "Position" }
        CText {
            variant: "caption"
            text: root.node ? "x: " + Math.round(root.node.position[0]) + "  y: " + Math.round(root.node.position[1]) : ""
        }

        CDivider { Layout.fillWidth: true }

        // Parameters
        CText { variant: "body2"; text: "Parameters"; font.bold: true }

        ListView {
            Layout.fillWidth: true
            Layout.preferredHeight: Math.min(contentHeight, 200)
            clip: true
            spacing: 8

            model: {
                if (!root.node) return []
                var regEntry = NodeRegistry.nodeType(root.node.type)
                return regEntry ? (regEntry.properties || []) : []
            }

            delegate: ColumnLayout {
                width: parent ? parent.width : 250
                spacing: 4

                CText {
                    variant: "caption"
                    text: modelData.displayName || modelData.name
                }

                Loader {
                    Layout.fillWidth: true
                    sourceComponent: {
                        if (modelData.options && modelData.options.length > 0) return selectComp
                        return textFieldComp
                    }
                }

                Component {
                    id: textFieldComp
                    CTextField {
                        text: root.node && root.node.parameters
                            ? (root.node.parameters[modelData.name] || modelData.default || "") : ""
                        placeholderText: modelData.description || ""
                        onTextChanged: {
                            if (root.node) {
                                root.parameterChanged(modelData.name, text)
                            }
                        }
                    }
                }

                Component {
                    id: selectComp
                    CSelect {
                        model: {
                            var opts = modelData.options || []
                            var labels = []
                            for (var i = 0; i < opts.length; i++) {
                                labels.push(opts[i].name || opts[i].value || "")
                            }
                            return labels
                        }
                    }
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        // Inputs/Outputs display
        CText { variant: "body2"; text: "Ports"; font.bold: true }

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            ColumnLayout {
                spacing: 4
                CText { variant: "caption"; text: "Inputs" }
                Repeater {
                    model: root.node ? (root.node.inputs || []) : []
                    CChip {
                        text: modelData.displayName || modelData.name
                        chipColor: Theme.primary
                    }
                }
                CText {
                    visible: !root.node || !root.node.inputs || root.node.inputs.length === 0
                    variant: "caption"
                    text: "None"
                    opacity: 0.5
                }
            }

            ColumnLayout {
                spacing: 4
                CText { variant: "caption"; text: "Outputs" }
                Repeater {
                    model: root.node ? (root.node.outputs || []) : []
                    CChip {
                        text: modelData.displayName || modelData.name
                        chipColor: Theme.success
                    }
                }
                CText {
                    visible: !root.node || !root.node.outputs || root.node.outputs.length === 0
                    variant: "caption"
                    text: "None"
                    opacity: 0.5
                }
            }
        }

        // Workflow Variables section
        CDivider { Layout.fillWidth: true; visible: Object.keys(root.workflowVariables).length > 0 }

        CText {
            variant: "body2"
            text: "Workflow Variables"
            font.bold: true
            visible: Object.keys(root.workflowVariables).length > 0
        }

        Repeater {
            model: Object.keys(root.workflowVariables)
            FlexRow {
                Layout.fillWidth: true
                spacing: 4
                CText { variant: "caption"; text: modelData + ":" }
                CText {
                    variant: "caption"
                    text: {
                        var v = root.workflowVariables[modelData]
                        return v ? (v.defaultValue !== undefined ? String(v.defaultValue) : "") : ""
                    }
                    opacity: 0.7
                }
            }
        }

        Item { Layout.fillHeight: true }
    }
}

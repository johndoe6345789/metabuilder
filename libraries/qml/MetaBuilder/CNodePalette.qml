import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root

    property string searchText: ""
    property string selectedGroup: ""
    property bool isDark: false

    signal nodeDoubleClicked(string nodeType)

    spacing: 8

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

    FlexRow {
        Layout.fillWidth: true
        spacing: 4
        CText { variant: "h4"; text: "Node Palette" }
        CText {
            variant: "caption"
            text: (NodeRegistry ? NodeRegistry.nodeCount || 0 : 0)
                + " types"
        }
    }

    CTextField {
        Layout.fillWidth: true
        placeholderText: "Search nodes..."
        text: root.searchText
        onTextChanged: root.searchText = text
    }

    // Group filter chips
    Flow {
        Layout.fillWidth: true
        spacing: 4
        CChip {
            text: "All"
            selected: root.selectedGroup === ""
            chipColor: Theme.primary
            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: root.selectedGroup = ""
            }
        }
        Repeater {
            model: NodeRegistry ? (NodeRegistry.groups || []) : []
            CChip {
                text: modelData
                selected: root.selectedGroup === modelData
                chipColor: root.groupColor(modelData + ".x")
                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: root.selectedGroup = (
                        root.selectedGroup === modelData) ? "" : modelData
                }
            }
        }
    }

    // Node type list
    ListView {
        id: paletteList
        Layout.fillWidth: true
        Layout.fillHeight: true
        clip: true
        spacing: 2

        model: {
            if (!NodeRegistry) return []
            var nodes = root.searchText
                ? (NodeRegistry.searchNodes(root.searchText) || [])
                : (root.selectedGroup
                    ? (NodeRegistry.nodesByGroup(root.selectedGroup) || [])
                    : (NodeRegistry.nodeTypes || []))
            return nodes
        }

        delegate: CNodePaletteItem {
            width: paletteList.width
            accentColor: root.groupColor(modelData.name || "")
            onNodeDoubleClicked: (nodeType) => root.nodeDoubleClicked(nodeType)
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: treeView
    
    property var model: []
    property bool multiSelect: false
    property var expanded: []
    property var selected: []
    property string defaultExpandIcon: "▶"
    property string defaultCollapseIcon: "▼"
    property string defaultEndIcon: ""
    
    signal nodeToggled(string nodeId, bool isExpanded)
    signal nodeSelected(string nodeId)
    
    implicitWidth: parent ? parent.width : 300
    implicitHeight: listView.contentHeight
    
    function isExpanded(nodeId) {
        return expanded.indexOf(nodeId) !== -1
    }
    
    function isSelected(nodeId) {
        return selected.indexOf(nodeId) !== -1
    }
    
    function toggleNode(nodeId) {
        var idx = expanded.indexOf(nodeId)
        if (idx !== -1) {
            expanded.splice(idx, 1)
            nodeToggled(nodeId, false)
        } else {
            expanded.push(nodeId)
            nodeToggled(nodeId, true)
        }
        expanded = expanded.slice() // Trigger binding update
    }
    
    function selectNode(nodeId) {
        if (multiSelect) {
            var idx = selected.indexOf(nodeId)
            if (idx !== -1) {
                selected.splice(idx, 1)
            } else {
                selected.push(nodeId)
            }
            selected = selected.slice()
        } else {
            selected = [nodeId]
        }
        nodeSelected(nodeId)
    }
    
    // Flatten tree for display
    function flattenTree(nodes, level) {
        var result = []
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i]
            result.push({
                nodeId: node.nodeId,
                label: node.label,
                icon: node.icon || "",
                level: level,
                hasChildren: node.children && node.children.length > 0,
                isExpanded: isExpanded(node.nodeId),
                isSelected: isSelected(node.nodeId)
            })
            if (node.children && isExpanded(node.nodeId)) {
                result = result.concat(flattenTree(node.children, level + 1))
            }
        }
        return result
    }
    
    property var flatModel: flattenTree(model, 0)
    
    ListView {
        id: listView
        anchors.fill: parent
        model: treeView.flatModel
        clip: true
        
        delegate: Item {
            width: listView.width
            height: 32
            
            Rectangle {
                anchors.fill: parent
                color: modelData.isSelected ? Qt.rgba(0.1, 0.46, 0.82, 0.12) : 
                       itemMouse.containsMouse ? Qt.rgba(0, 0, 0, 0.04) : "transparent"
                radius: 4
            }
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 8 + modelData.level * 20
                anchors.rightMargin: 8
                spacing: 4
                
                // Expand/collapse icon
                Text {
                    visible: modelData.hasChildren
                    text: modelData.isExpanded ? treeView.defaultCollapseIcon : treeView.defaultExpandIcon
                    font.pixelSize: 10
                    color: "#666666"
                    
                    MouseArea {
                        anchors.fill: parent
                        anchors.margins: -4
                        onClicked: treeView.toggleNode(modelData.nodeId)
                    }
                }
                
                // End icon for leaf nodes
                Text {
                    visible: !modelData.hasChildren && treeView.defaultEndIcon
                    text: treeView.defaultEndIcon
                    font.pixelSize: 10
                    color: "#666666"
                }
                
                // Custom icon
                Text {
                    visible: modelData.icon
                    text: modelData.icon
                    font.pixelSize: 14
                }
                
                // Label
                Text {
                    Layout.fillWidth: true
                    text: modelData.label
                    font.pixelSize: 14
                    color: modelData.isSelected ? "#1976d2" : "#1a1a1a"
                    elide: Text.ElideRight
                }
            }
            
            MouseArea {
                id: itemMouse
                anchors.fill: parent
                hoverEnabled: true
                onClicked: treeView.selectNode(modelData.nodeId)
            }
        }
    }
}

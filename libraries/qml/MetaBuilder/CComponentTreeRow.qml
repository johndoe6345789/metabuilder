import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "row_component_tree"
    Accessible.role: Accessible.ListItem
    Accessible.name: node ? node.name : ""
    Accessible.description: node
        ? node.type + ", depth "
            + node.depth
            + (childCount > 0
                ? ", " + childCount + " children"
                : "")
        : ""
    activeFocusOnTab: true
    Keys.onReturnPressed: root.clicked()
    Keys.onSpacePressed: root.clicked()

    property var node
    property bool isSelected: false
    property int childCount: 0

    signal clicked()

    width: parent ? parent.width : 400
    height: 40
    radius: 6
    color: isSelected
        ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
                      : mouseArea.containsMouse ? Theme.surface : "transparent"

    function typeBadgeColor(nodeType) {
        switch (nodeType) {
            case "container": return "#5C6BC0"
            case "layout":    return "#26A69A"
            case "widget":    return "#FFA726"
            case "atom":      return "#EF5350"
            default:          return Theme.primary
        }
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12 + (root.node ? root.node.depth * 24 : 0)
        anchors.rightMargin: 12
        spacing: 8

        CText {
            visible: root.node && root.node.depth > 0
            variant: "caption"
            text: "\u251C\u2500"
            opacity: 0.4
        }

        Rectangle {
            width: 8; height: 8; radius: 4
            color: root.node ? typeBadgeColor(root.node.type) : "#9e9e9e"
        }

        CText {
            variant: root.isSelected ? "body1" : "body2"
            text: root.node ? root.node.name : ""
            Layout.fillWidth: true
        }

        CText {
            variant: "caption"
            text: root.node && root.node.visible ? "\uD83D\uDC41" : "\u2014"
            opacity: root.node && root.node.visible ? 0.6 : 0.3
        }

        CBadge {
            visible: root.childCount > 0
            text: root.childCount.toString()
        }
    }
}

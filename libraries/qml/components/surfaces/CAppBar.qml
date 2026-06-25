import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ToolBar {
    id: appbar
    Accessible.role: Accessible.ToolBar
    Accessible.name: "Application toolbar"

    background: Rectangle {
        color: Theme.paper
        border.color: Theme.border
        border.width: 1

        // Bottom border only
        Rectangle {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: 1
            color: Theme.border
        }
    }

    RowLayout { anchors.fill: parent }
}

import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "menuitem_" + action
    Accessible.role: Accessible.MenuItem
    Accessible.name: label
    activeFocusOnTab: true

    property bool isDark: Theme.mode === "dark"
    property string icon: ""
    property string label: ""
    property color itemColor: "transparent"
    property string action: ""

    signal triggered(string action)

    Layout.fillWidth: true
    height: 36
    radius: 8
    color: itemMA.containsMouse
        ? (isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.04)) : "transparent"

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        spacing: 10
        CText {
            text: root.icon
            font.pixelSize: 14
            color: root.itemColor !== "transparent"
                ? root.itemColor : Theme.textSecondary
        }
        CText {
            text: root.label
            font.pixelSize: 13
            color: root.itemColor !== "transparent"
                ? root.itemColor : Theme.text
        }
    }

    Keys.onReturnPressed: root.triggered(root.action)
    Keys.onSpacePressed: root.triggered(root.action)

    MouseArea {
        id: itemMA
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.triggered(root.action)
    }
}

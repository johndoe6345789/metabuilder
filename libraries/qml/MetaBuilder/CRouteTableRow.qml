import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var routeData
    property bool isSelected: false
    property int routeIndex: -1
    property int routeCount: 0

    signal clicked()
    signal moveUp()
    signal moveDown()

    width: parent ? parent.width : 400
    height: 48
    color: isSelected
        ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.1)
        : (hoverHandler.hovered ? Theme.surface : "transparent")
    radius: 4

    function levelColor(level) {
        if (level <= 1) return "#4caf50"
        if (level === 2) return "#8bc34a"
        if (level === 3) return "#ff9800"
        if (level === 4) return "#f44336"
        return "#9c27b0"
    }

    HoverHandler { id: hoverHandler }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 0

        RowLayout {
            Layout.preferredWidth: 60
            spacing: 2

            CButton {
                text: "\u25B2"
                variant: "ghost"
                size: "sm"
                enabled: routeIndex > 0
                onClicked: root.moveUp()
            }
            CButton {
                text: "\u25BC"
                variant: "ghost"
                size: "sm"
                enabled: routeIndex < routeCount - 1
                onClicked: root.moveDown()
            }
        }

        CText {
            variant: "body2"
            text: routeData ? routeData.path : ""
            Layout.preferredWidth: 120
            color: Theme.primary
        }

        CText {
            variant: "body2"
            text: routeData ? routeData.title : ""
            Layout.preferredWidth: 120
        }

        Rectangle {
            Layout.preferredWidth: 60
            height: 24
            width: 32
            radius: 12
            color: routeData ? levelColor(routeData.level) : "#9e9e9e"

            CText {
                anchors.centerIn: parent
                variant: "caption"
                text: routeData ? routeData.level.toString() : ""
                color: "#ffffff"
            }
        }

        CChip {
            text: routeData ? routeData.layout : ""
            Layout.preferredWidth: 100
        }

        Rectangle {
            Layout.fillWidth: true
            height: 10
            width: 10
            radius: 5
            color: routeData && routeData.enabled ? "#4caf50" : "#9e9e9e"
            Layout.alignment: Qt.AlignVCenter
            Layout.preferredWidth: 10
            Layout.preferredHeight: 10
        }
    }
}

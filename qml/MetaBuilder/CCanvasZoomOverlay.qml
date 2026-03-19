import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property real zoom: 1.0

    signal zoomIn()
    signal zoomOut()

    width: 120
    height: 36
    radius: 18
    color: Qt.rgba(Theme.paper.r || 0.1, Theme.paper.g || 0.1,
        Theme.paper.b || 0.1, 0.9)
    border.color: Theme.border
    border.width: 1

    RowLayout {
        anchors.centerIn: parent
        spacing: 8

        CButton {
            text: "-"
            variant: "ghost"
            size: "sm"
            onClicked: root.zoomOut()
        }

        CText {
            variant: "caption"
            text: Math.round(root.zoom * 100) + "%"
        }

        CButton {
            text: "+"
            variant: "ghost"
            size: "sm"
            onClicked: root.zoomIn()
        }
    }
}

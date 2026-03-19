import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "overlay_canvas_zoom"
    Accessible.role: Accessible.ToolBar
    Accessible.name: "Zoom Controls"
    Accessible.description:
        "Zoom in or out on the workflow canvas"

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
            objectName: "btn_zoom_out"
            text: "-"
            variant: "ghost"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Zoom Out"
            Accessible.description:
                "Decrease canvas zoom level"
            onClicked: root.zoomOut()
            Keys.onReturnPressed: root.zoomOut()
            Keys.onSpacePressed:  root.zoomOut()
        }

        CText {
            variant: "caption"
            text: Math.round(root.zoom * 100) + "%"
            Accessible.role: Accessible.StaticText
            Accessible.name:
                "Zoom level " +
                Math.round(root.zoom * 100) +
                " percent"
        }

        CButton {
            objectName: "btn_zoom_in"
            text: "+"
            variant: "ghost"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Zoom In"
            Accessible.description:
                "Increase canvas zoom level"
            onClicked: root.zoomIn()
            Keys.onReturnPressed: root.zoomIn()
            Keys.onSpacePressed:  root.zoomIn()
        }
    }
}

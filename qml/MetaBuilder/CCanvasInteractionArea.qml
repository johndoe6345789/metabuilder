import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

MouseArea {
    id: root
    objectName: "area_canvas_interaction"
    Accessible.role: Accessible.Pane
    Accessible.name: "Canvas Interaction Area"

    property bool drawingConnection: false

    signal connectionDragUpdated(real x, real y)
    signal connectionDragFinished()
    signal canvasClicked()
    signal zoomRequested(real zoomDelta)

    z: 0
    acceptedButtons: Qt.LeftButton | Qt.MiddleButton
    hoverEnabled: true

    onPositionChanged: function(mouse) {
        if (root.drawingConnection) {
            root.connectionDragUpdated(mouse.x, mouse.y)
        }
    }

    onReleased: function(mouse) {
        if (root.drawingConnection) {
            root.connectionDragFinished()
        }
    }

    onClicked: function(mouse) {
        root.canvasClicked()
    }

    onWheel: function(wheel) {
        var zoomDelta = wheel.angleDelta.y > 0 ? 0.1 : -0.1
        root.zoomRequested(zoomDelta)
    }
}

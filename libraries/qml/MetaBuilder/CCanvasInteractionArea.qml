import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

MouseArea {
    id: root
    objectName: "area_canvas_interaction"
    Accessible.role: Accessible.Canvas
    Accessible.name: "Canvas Interaction Area"
    Accessible.description:
        "Pan the canvas by dragging. " +
        "Scroll to zoom in or out. " +
        "Click to deselect nodes."
    activeFocusOnTab: true

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

    Keys.onReturnPressed: root.canvasClicked()
    Keys.onSpacePressed:  root.canvasClicked()
    Keys.onPressed: function(event) {
        if (event.key === Qt.Key_Plus ||
                event.key === Qt.Key_Equal) {
            root.zoomRequested(0.1)
            event.accepted = true
        } else if (event.key === Qt.Key_Minus) {
            root.zoomRequested(-0.1)
            event.accepted = true
        }
    }
}

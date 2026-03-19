import QtQuick

Canvas {
    id: root
    objectName: "canvas_grid"
    Accessible.role: Accessible.Canvas
    Accessible.name: "Canvas Grid"
    Accessible.description:
        "Background grid overlay for the workflow canvas"

    onPaint: {
        var ctx = getContext("2d")
        ctx.reset()
        var gridSize = 50
        ctx.strokeStyle = Qt.rgba(0.5, 0.5, 0.5, 0.1)
        ctx.lineWidth = 1

        for (var x = 0; x < width; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
            ctx.stroke()
        }
        for (var y = 0; y < height; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }
    }

    Component.onCompleted: requestPaint()
}

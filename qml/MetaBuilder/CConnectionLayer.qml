import QtQuick
import QmlComponents 1.0

Canvas {
    id: root
    objectName: "layer_connection"
    Accessible.role: Accessible.Canvas
    Accessible.name: "Connection Layer"
    Accessible.description:
        "Renders Bezier curves between " +
        "connected workflow node ports"

    property var nodes: []
    property var connections: ({})
    property bool drawingConnection: false
    property string connSourceNode: ""
    property bool connSourceIsOutput: true
    property real connDragX: 0
    property real connDragY: 0
    property bool isDark: false

    function groupColor(nodeType) {
        var prefix = nodeType ? nodeType.split(".")[0] : ""
        switch (prefix) {
            case "metabuilder": return Theme.success
            case "logic":       return Theme.warning
            case "transform":
            case "packagerepo": return "#FF9800"
            case "sdl":
            case "graphics":    return "#2196F3"
            case "integration": return "#9C27B0"
            case "io":          return "#00BCD4"
            default:            return Theme.primary
        }
    }

    function findNodeById(id) {
        if (!nodes) return null
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) return nodes[i]
        }
        return null
    }

    onPaint: {
        var ctx = getContext("2d")
        ctx.reset()
        ctx.lineWidth = 2.5

        if (!connections || !nodes) return

        var nodeW = 180
        var headerH = 32
        var portSpacing = 24
        var portOffset = 8

        // Draw established connections
        for (var srcId in connections) {
            var srcNode = findNodeById(srcId)
            if (!srcNode) continue

            var srcConns = connections[srcId]
            for (var outName in srcConns) {
                for (var outIdx in srcConns[outName]) {
                    var targets = srcConns[outName][outIdx]
                    var outIndex = parseInt(outIdx)
                    var srcX = srcNode.position[0] + nodeW
                    var srcY = srcNode.position[1]
                        + headerH + portOffset
                        + outIndex * portSpacing + 6

                    for (var t = 0; t < targets.length; t++) {
                        var target = targets[t]
                        var dstNode = findNodeById(target.node)
                        if (!dstNode) continue

                        var inIndex = target.index || 0
                        var dstX = dstNode.position[0]
                        var dstY = dstNode.position[1]
                            + headerH + portOffset
                            + inIndex * portSpacing + 6

                        // Draw Bezier
                        var cpOffset = Math.max(80, Math.abs(dstX - srcX) * 0.4)
                        ctx.strokeStyle = groupColor(srcNode.type)
                        ctx.globalAlpha = 0.8
                        ctx.beginPath()
                        ctx.moveTo(srcX, srcY)
                        ctx.bezierCurveTo(
                            srcX + cpOffset, srcY,
                            dstX - cpOffset, dstY,
                            dstX, dstY)
                        ctx.stroke()

                        // Arrow at destination
                        ctx.globalAlpha = 1.0
                        ctx.fillStyle = groupColor(srcNode.type)
                        ctx.beginPath()
                        ctx.moveTo(dstX, dstY)
                        ctx.lineTo(dstX - 8, dstY - 4)
                        ctx.lineTo(dstX - 8, dstY + 4)
                        ctx.closePath()
                        ctx.fill()
                    }
                }
            }
        }

        // Draw connection being dragged
        if (drawingConnection && connSourceNode) {
            var dragSrc = findNodeById(connSourceNode)
            if (dragSrc) {
                var sx, sy
                if (connSourceIsOutput) {
                    sx = dragSrc.position[0] + nodeW
                    sy = dragSrc.position[1] + headerH + portOffset + 6
                } else {
                    sx = dragSrc.position[0]
                    sy = dragSrc.position[1] + headerH + portOffset + 6
                }
                var dx = connDragX
                var dy = connDragY
                var cp = Math.max(60, Math.abs(dx - sx) * 0.4)

                ctx.strokeStyle = Theme.primary
                ctx.globalAlpha = 0.6
                ctx.setLineDash([6, 4])
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(sx, sy)
                ctx.bezierCurveTo(sx + cp, sy, dx - cp, dy, dx, dy)
                ctx.stroke()
                ctx.setLineDash([])
            }
        }
    }
}

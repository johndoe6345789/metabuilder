import QtQuick
import QmlComponents 1.0

/**
 * CSpinner.qml - Material Design 3 Circular Progress Indicator
 *
 * MD3 spec: Canvas-based arc with rotation + arc sweep animation.
 * Arc sweeps between 10-300 degrees while the whole spinner rotates at
 // 1.5s/rev.
 *
 * Usage:
 *   CSpinner {}
 *   CSpinner { size: "lg" }
 *   CSpinner { size: "sm"; color: Theme.success }
 */
Item {
    id: root

    // Accessibility
    Accessible.role: Accessible.Animation
    Accessible.name: "Loading"

    // Public properties
    property string size: "md"          // sm (24px), md (40px), lg (56px)
    property color color: Theme.primary
    property int strokeWidth: 4

    // Size mapping (MD3 defaults)
    readonly property int _diameter: {
        switch (size) {
            case "sm": return 24
            case "lg": return 56
            default: return 40
        }
    }

    implicitWidth: _diameter
    implicitHeight: _diameter

    // Rotation animation: 1.5s per full revolution
    NumberAnimation on rotation {
        from: 0
        to: 360
        duration: 1500
        loops: Animation.Infinite
        running: root.visible
    }

    Canvas {
        id: canvas
        anchors.fill: parent

        // Arc sweep: oscillates between 10 and 300 degrees
        property real sweepAngle: 10
        property real sweepOffset: 0

        SequentialAnimation on sweepAngle {
            running: root.visible
            loops: Animation.Infinite

            NumberAnimation {
                from: 10
                to: 300
                duration: 750
                easing.type: Easing.InOutCubic
            }
            NumberAnimation {
                from: 300
                to: 10
                duration: 750
                easing.type: Easing.InOutCubic
            }
        }

        // Offset rotates so the shrinking arc doesn't snap back
        NumberAnimation on sweepOffset {
            from: 0
            to: 720
            duration: 3000
            loops: Animation.Infinite
            running: root.visible
        }

        onSweepAngleChanged: requestPaint()
        onSweepOffsetChanged: requestPaint()

        onPaint: {
            var ctx = getContext("2d")
            ctx.reset()

            var centerX = width / 2
            var centerY = height / 2
            var radius = (Math.min(width, height) - root.strokeWidth) / 2

            ctx.strokeStyle = root.color
            ctx.lineWidth = root.strokeWidth
            ctx.lineCap = "round"

            // Convert degrees to radians
            var startRad = (sweepOffset - 90) * Math.PI / 180
            var endRad = startRad + sweepAngle * Math.PI / 180

            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, startRad, endRad)
            ctx.stroke()
        }
    }
}

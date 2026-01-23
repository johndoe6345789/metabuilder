import QtQuick

/**
 * CSpinner.qml - Loading spinner (mirrors _spinner.scss)
 * Simple rotating loading indicator
 * 
 * Usage:
 *   CSpinner {}
 *   CSpinner { size: "lg"; color: Theme.success }
 */
Item {
    id: root
    
    // Public properties
    property string size: "md"  // sm, md, lg
    property color color: Theme.primary
    property int strokeWidth: size === "sm" ? 2 : (size === "lg" ? 4 : 3)
    
    // Size
    implicitWidth: _size
    implicitHeight: _size
    
    readonly property int _size: {
        switch (size) {
            case "sm": return 20
            case "lg": return 48
            default: return 32
        }
    }
    
    // Spinning animation
    Canvas {
        id: canvas
        anchors.fill: parent
        
        property real angle: 0
        
        RotationAnimation on angle {
            from: 0
            to: 360
            duration: 1000
            loops: Animation.Infinite
            running: root.visible
        }
        
        onAngleChanged: requestPaint()
        
        onPaint: {
            var ctx = getContext("2d")
            ctx.reset()
            
            var centerX = width / 2
            var centerY = height / 2
            var radius = (Math.min(width, height) - root.strokeWidth) / 2
            
            // Draw arc
            ctx.strokeStyle = root.color
            ctx.lineWidth = root.strokeWidth
            ctx.lineCap = "round"
            
            var startAngle = (angle - 90) * Math.PI / 180
            var endAngle = startAngle + 1.5 * Math.PI
            
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, startAngle, endAngle)
            ctx.stroke()
        }
    }
}

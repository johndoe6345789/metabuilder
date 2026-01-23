import QtQuick

/**
 * CProgress.qml - Progress indicator (mirrors _progress.scss)
 * Linear or circular progress indicator
 * 
 * Usage:
 *   CProgress { value: 0.5 }                    // 50% linear
 *   CProgress { variant: "circular"; value: 0.75 }
 *   CProgress { indeterminate: true }           // Animated indeterminate
 */
Item {
    id: root
    
    // Public properties
    property real value: 0           // 0.0 to 1.0
    property string variant: "linear"  // linear, circular
    property bool indeterminate: false
    property string color: ""        // Custom color, uses primary if empty
    property string trackColor: ""   // Custom track color
    property int thickness: 4        // Line thickness
    property string size: "md"       // sm, md, lg (for circular)
    property string label: ""        // Optional label (for linear)
    
    // Computed colors
    readonly property color _progressColor: color || Theme.primary
    readonly property color _trackColor: trackColor || Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.12)
    
    // Size based on variant
    implicitWidth: variant === "circular" ? _circularSize : 200
    implicitHeight: variant === "circular" ? _circularSize : (label ? thickness + StyleVariables.fontSizeSm + StyleVariables.spacingXs : thickness)
    
    readonly property int _circularSize: {
        switch (size) {
            case "sm": return 24
            case "lg": return 56
            default: return 40
        }
    }
    
    // Linear progress
    Item {
        visible: root.variant === "linear"
        anchors.fill: parent
        
        // Track
        Rectangle {
            id: track
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.top: parent.top
            height: root.thickness
            radius: root.thickness / 2
            color: root._trackColor
        }
        
        // Progress bar
        Rectangle {
            id: progressBar
            anchors.left: parent.left
            anchors.top: parent.top
            height: root.thickness
            width: root.indeterminate ? parent.width * 0.3 : parent.width * root.value
            radius: root.thickness / 2
            color: root._progressColor
            
            Behavior on width {
                enabled: !root.indeterminate
                NumberAnimation { duration: StyleVariables.transitionNormal }
            }
        }
        
        // Indeterminate animation
        SequentialAnimation on progressBar.x {
            running: root.indeterminate && root.variant === "linear"
            loops: Animation.Infinite
            
            NumberAnimation {
                from: -track.width * 0.3
                to: track.width
                duration: 1500
                easing.type: Easing.InOutQuad
            }
        }
        
        // Label
        Text {
            visible: root.label
            anchors.top: track.bottom
            anchors.topMargin: StyleVariables.spacingXs
            anchors.horizontalCenter: parent.horizontalCenter
            text: root.label
            font.pixelSize: StyleVariables.fontSizeXs
            color: Theme.textSecondary
        }
    }
    
    // Circular progress
    Item {
        visible: root.variant === "circular"
        anchors.fill: parent
        
        // Track circle
        Canvas {
            id: circularTrack
            anchors.fill: parent
            
            onPaint: {
                var ctx = getContext("2d")
                ctx.reset()
                ctx.strokeStyle = root._trackColor
                ctx.lineWidth = root.thickness
                ctx.lineCap = "round"
                
                var centerX = width / 2
                var centerY = height / 2
                var radius = (Math.min(width, height) - root.thickness) / 2
                
                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
                ctx.stroke()
            }
        }
        
        // Progress arc
        Canvas {
            id: circularProgress
            anchors.fill: parent
            
            property real animatedValue: root.indeterminate ? 0.25 : root.value
            property real rotation: 0
            
            Behavior on animatedValue {
                enabled: !root.indeterminate
                NumberAnimation { duration: StyleVariables.transitionNormal }
            }
            
            // Indeterminate rotation
            RotationAnimation on rotation {
                running: root.indeterminate
                from: 0
                to: 360
                duration: 1400
                loops: Animation.Infinite
            }
            
            transform: Rotation {
                origin.x: circularProgress.width / 2
                origin.y: circularProgress.height / 2
                angle: circularProgress.rotation - 90
            }
            
            onPaint: {
                var ctx = getContext("2d")
                ctx.reset()
                ctx.strokeStyle = root._progressColor
                ctx.lineWidth = root.thickness
                ctx.lineCap = "round"
                
                var centerX = width / 2
                var centerY = height / 2
                var radius = (Math.min(width, height) - root.thickness) / 2
                
                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI * animatedValue)
                ctx.stroke()
            }
            
            onAnimatedValueChanged: requestPaint()
            onRotationChanged: requestPaint()
        }
        
        // Center label (percentage)
        Text {
            visible: !root.indeterminate && root.size !== "sm"
            anchors.centerIn: parent
            text: Math.round(root.value * 100) + "%"
            font.pixelSize: root._circularSize / 4
            font.weight: Font.Medium
            color: Theme.text
        }
    }
}

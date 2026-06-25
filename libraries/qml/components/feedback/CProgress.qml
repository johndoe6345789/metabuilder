import QtQuick
import QmlComponents 1.0

/**
 * CProgress.qml - Material Design 3 Linear Progress Indicator
 *
 * MD3 spec: 4px track with rounded ends, primary indicator, indeterminate
 // sliding animation
 *
 * Usage:
 *   CProgress { value: 0.5 }                    // 50% determinate
 *   CProgress { indeterminate: true }            // Animated indeterminate
 *   CProgress { value: 0.75; label: "75%" }      // With label
 */
Item {
    id: root

    // Accessibility
    Accessible.role: Accessible.ProgressBar
    Accessible.name: label || "Progress"
    Accessible.value: value * 100

    // Public properties
    property real value: 0              // 0.0 to 1.0
    property bool indeterminate: false
    // Custom indicator color, uses Theme.primary if empty
    property string color: ""
    property string trackColor: ""      // Custom track color
    property string size: "md"          // sm, md, lg (track thickness)
    property string label: ""           // Optional label below track

    // Computed colors (MD3: primary for indicator, surfaceContainerHighest for
    // track)
    readonly property color _indicatorColor: color || Theme.primary
    readonly property color _trackColor: trackColor ||
        Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.38)

    // MD3 track height: 4px standard
    readonly property int _trackHeight: {
        switch (size) {
            case "sm": return 2
            case "lg": return 6
            default: return 4
        }
    }

    implicitWidth: 200
    implicitHeight: label
        ? _trackHeight + Theme.fontSizeXs + Theme.spacingXs : _trackHeight

    // Track background (MD3: rounded, surfaceContainerHighest)
    Rectangle {
        id: track
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        height: root._trackHeight
        radius: root._trackHeight / 2
        color: root._trackColor
        clip: true

        // Determinate indicator
        Rectangle {
            id: determinateBar
            visible: !root.indeterminate
            anchors.left: parent.left
            anchors.top: parent.top
            height: parent.height
            width: parent.width * Math.max(0, Math.min(1, root.value))
            radius: root._trackHeight / 2
            color: root._indicatorColor

            Behavior on width {
                NumberAnimation {
                    duration: Theme.transitionStandard
                    easing.type: Easing.OutCubic
                }
            }
        }

        // Indeterminate indicator (MD3: sliding bar that traverses the track)
        Rectangle {
            id: indeterminateBar
            visible: root.indeterminate
            anchors.top: parent.top
            height: parent.height
            width: parent.width * 0.4
            radius: root._trackHeight / 2
            color: root._indicatorColor

            SequentialAnimation {
                running: root.indeterminate && root.visible
                loops: Animation.Infinite

                // Slide right, accelerating
                NumberAnimation {
                    target: indeterminateBar
                    property: "x"
                    from: -indeterminateBar.width
                    to: track.width
                    duration: 1500
                    easing.type: Easing.InOutQuad
                }
            }
        }
    }

    // Optional label
    Text {
        visible: root.label !== ""
        anchors.top: track.bottom
        anchors.topMargin: Theme.spacingXs
        anchors.horizontalCenter: parent.horizontalCenter
        text: root.label
        font.pixelSize: Theme.fontSizeXs
        font.family: Theme.fontFamily
        color: Theme.textSecondary
    }
}

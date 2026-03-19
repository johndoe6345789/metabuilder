import QtQuick
import QtQuick.Layouts
import QtQuick.Effects
import QmlComponents 1.0

/**
 * CSnackbar.qml - Material Design 3 Snackbar/toast notification
 * Brief messages at the bottom of the screen
 *
 * Usage:
 *   CSnackbar {
 *       id: snackbar
 *   }
 *
 *   // Show snackbar
 *   snackbar.show("Message saved!", "success")
 *   snackbar.show("Error occurred", "error", 5000, "Retry", () => { retry() })
 */
Item {
    id: root

    // Accessibility
    Accessible.role: Accessible.AlertMessage
    Accessible.name: _message

    // Public properties
    property int duration: 4000  // Auto-hide duration in ms (0 = no auto-hide)
    property string position: "bottom"  // bottom, top
    property int maxWidth: 480

    // Internal state
    property string _message: ""
    // default, success, warning, error, info
    property string _severity: "default"
    property string _actionText: ""
    property var _actionCallback: null
    property bool _visible: false

    // Signals
    signal actionClicked()

    // Size
    width: parent.width
    height: snackbarRect.height + 24 * 2

    // Position
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.bottom: position === "bottom" ? parent.bottom : undefined
    anchors.top: position === "top" ? parent.top : undefined

    // Z-index
    z: StyleVariables.zToast

    // Show snackbar
    function show(message, severity, customDuration, actionText,
        actionCallback) {
        _message = message || ""
        _severity = severity || "default"
        _actionText = actionText || ""
        _actionCallback = actionCallback || null
        _visible = true

        // Start auto-hide timer
        if ((customDuration !== undefined ? customDuration : duration) > 0) {
            hideTimer.interval = customDuration !== undefined
                ? customDuration : duration
            hideTimer.restart()
        }
    }

    // Hide snackbar
    function hide() {
        _visible = false
        hideTimer.stop()
    }

    // Auto-hide timer
    Timer {
        id: hideTimer
        onTriggered: root.hide()
    }

    // MD3 inverse surface color
    readonly property color _inverseSurface: Theme.mode === "dark"
        ? "#E6E1E5" : "#313033"
    // MD3 inverse on surface (text color)
    readonly property color _inverseOnSurface: Theme.mode === "dark"
        ? "#313033" : "#F4EFF4"
    // MD3 inverse primary (action button color)
    readonly property color _inversePrimary: Theme.mode === "dark"
        ? Qt.darker(Theme.primary, 1.3) : Qt.lighter(Theme.primary, 1.4)

    // Snackbar content
    Rectangle {
        id: snackbarRect

        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: root.position === "bottom" ? parent.bottom : undefined
        anchors.top: root.position === "top" ? parent.top : undefined
        anchors.bottomMargin: 16
        anchors.topMargin: 16

        width: Math.min(contentRow.implicitWidth + 16 * 2, root.maxWidth)
        height: contentRow.implicitHeight + 14 * 2

        radius: 8
        color: root._inverseSurface

        // MD3 elevation 3 shadow
        layer.enabled: true
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowColor: "#40000000"
            shadowBlur: 0.4
            shadowVerticalOffset: 6
            shadowHorizontalOffset: 0
        }

        // Slide-in animation from bottom/top
        opacity: root._visible ? 1 : 0
        transform: Translate {
            y: root._visible ? 0 : (root.position === "bottom" ? 60 : -60)

            Behavior on y {
                NumberAnimation {
                    duration: 300
                    easing.type: Easing.OutCubic
                }
            }
        }

        Behavior on opacity {
            NumberAnimation {
                duration: root._visible ? 250 : 200
                easing.type: root._visible ? Easing.OutCubic : Easing.InCubic
            }
        }

        // Content
        RowLayout {
            id: contentRow
            anchors.verticalCenter: parent.verticalCenter
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.leftMargin: 16
            anchors.rightMargin: 16
            spacing: 12

            // Message text — MD3 inverse on surface
            Text {
                text: root._message
                font.pixelSize: 14
                font.letterSpacing: 0.25
                color: root._inverseOnSurface
                Layout.fillWidth: true
                Layout.maximumWidth: root.maxWidth - 16 * 3 - (
                    actionButton.visible ? actionButton.width + 12 : 0)
                wrapMode: Text.WordWrap
                lineHeight: 1.4
            }

            // Action button — MD3 inverse primary, text style
            Rectangle {
                id: actionButton
                visible: root._actionText !== ""
                width: actionLabel.implicitWidth + 16
                height: actionLabel.implicitHeight + 12
                radius: 4
                color: actionArea.containsMouse ?
                    Qt.rgba(root._inversePrimary.r, root._inversePrimary.g,
                        root._inversePrimary.b, 0.12) : "transparent"

                Text {
                    id: actionLabel
                    anchors.centerIn: parent
                    text: root._actionText
                    font.pixelSize: 14
                    font.weight: Font.DemiBold
                    font.letterSpacing: 0.1
                    color: root._inversePrimary
                }

                MouseArea {
                    id: actionArea
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    hoverEnabled: true
                    onClicked: {
                        if (root._actionCallback) {
                            root._actionCallback()
                        }
                        root.actionClicked()
                        root.hide()
                    }
                }
            }
        }

        // Dismiss on click
        MouseArea {
            anchors.fill: parent
            z: -1
            onClicked: root.hide()
        }
    }
}

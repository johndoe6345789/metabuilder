import QtQuick
import QtQuick.Layouts
import QtQuick.Effects

/**
 * CSnackbar.qml - Snackbar/toast notification (mirrors _snackbar.scss)
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
    
    // Public properties
    property int duration: 4000  // Auto-hide duration in ms (0 = no auto-hide)
    property string position: "bottom"  // bottom, top
    property int maxWidth: 400
    
    // Internal state
    property string _message: ""
    property string _severity: "default"  // default, success, warning, error, info
    property string _actionText: ""
    property var _actionCallback: null
    property bool _visible: false
    
    // Signals
    signal actionClicked()
    
    // Size
    width: parent.width
    height: snackbarRect.height + StyleVariables.spacingLg * 2
    
    // Position
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.bottom: position === "bottom" ? parent.bottom : undefined
    anchors.top: position === "top" ? parent.top : undefined
    
    // Z-index
    z: StyleVariables.zToast
    
    // Show snackbar
    function show(message, severity, customDuration, actionText, actionCallback) {
        _message = message || ""
        _severity = severity || "default"
        _actionText = actionText || ""
        _actionCallback = actionCallback || null
        _visible = true
        
        // Start auto-hide timer
        if ((customDuration !== undefined ? customDuration : duration) > 0) {
            hideTimer.interval = customDuration !== undefined ? customDuration : duration
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
    
    // Snackbar content
    Rectangle {
        id: snackbarRect
        
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: root.position === "bottom" ? parent.bottom : undefined
        anchors.top: root.position === "top" ? parent.top : undefined
        anchors.margins: StyleVariables.spacingMd
        
        width: Math.min(contentRow.implicitWidth + StyleVariables.spacingMd * 2, root.maxWidth)
        height: contentRow.implicitHeight + StyleVariables.spacingSm * 2
        
        radius: StyleVariables.radiusSm
        color: {
            switch (root._severity) {
                case "success": return "#1b5e20"
                case "warning": return "#e65100"
                case "error": return "#b71c1c"
                case "info": return "#0d47a1"
                default: return "#323232"
            }
        }
        
        // Shadow
        layer.enabled: true
        layer.effect: MultiEffect {
            shadowEnabled: true
            shadowColor: "#60000000"
            shadowBlur: 0.3
            shadowVerticalOffset: 4
        }
        
        // Visibility animation
        opacity: root._visible ? 1 : 0
        y: root._visible ? 0 : (root.position === "bottom" ? 20 : -20)
        
        Behavior on opacity { NumberAnimation { duration: StyleVariables.transitionNormal } }
        Behavior on y { NumberAnimation { duration: StyleVariables.transitionNormal; easing.type: Easing.OutCubic } }
        
        // Content
        RowLayout {
            id: contentRow
            anchors.centerIn: parent
            spacing: StyleVariables.spacingMd
            
            // Message
            Text {
                text: root._message
                font.pixelSize: StyleVariables.fontSizeSm
                color: "#ffffff"
                Layout.maximumWidth: root.maxWidth - StyleVariables.spacingMd * 4 - (actionButton.visible ? actionButton.width : 0)
                wrapMode: Text.WordWrap
            }
            
            // Action button
            Text {
                id: actionButton
                visible: root._actionText
                text: root._actionText
                font.pixelSize: StyleVariables.fontSizeSm
                font.weight: Font.Bold
                color: Theme.primaryLight
                
                MouseArea {
                    anchors.fill: parent
                    anchors.margins: -StyleVariables.spacingXs
                    cursorShape: Qt.PointingHandCursor
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
        
        // Close on click (optional)
        MouseArea {
            anchors.fill: parent
            z: -1
            onClicked: root.hide()
        }
    }
}

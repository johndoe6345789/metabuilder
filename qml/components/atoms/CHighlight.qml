import QtQuick

/**
 * CHighlight.qml - Text highlighting (mirrors _highlight.scss)
 * Highlight text with background color
 */
Rectangle {
    id: root
    
    property alias text: label.text
    property string variant: "default"   // default, success, warning, error, info
    
    // Color mapping
    readonly property color _bgColor: {
        switch (variant) {
            case "success": return Theme.successContainer
            case "warning": return Theme.warningContainer
            case "error": return Theme.errorContainer
            case "info": return Theme.infoContainer
            default: return Theme.mode === "dark" 
                ? Qt.rgba(255, 255, 0, 0.2) 
                : Qt.rgba(255, 255, 0, 0.4)
        }
    }
    
    readonly property color _textColor: {
        switch (variant) {
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error": return Theme.error
            case "info": return Theme.info
            default: return Theme.onSurface
        }
    }
    
    color: _bgColor
    radius: StyleVariables.radiusSm / 2
    
    implicitWidth: label.implicitWidth + StyleVariables.spacingXs * 2
    implicitHeight: label.implicitHeight + 2
    
    Text {
        id: label
        anchors.centerIn: parent
        color: root._textColor
        font.pixelSize: StyleVariables.fontSizeSm
    }
}

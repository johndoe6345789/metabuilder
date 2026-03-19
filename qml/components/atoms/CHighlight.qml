import QtQuick
import QmlComponents 1.0

/**
 * CHighlight.qml - Material Design 3 inline text highlight
 * Highlight text with tonal background color
 */
Rectangle {
    id: root

    property alias text: label.text
    // default, success, warning, error, info
    property string variant: "default"

    // MD3 tonal color mapping
    readonly property color _bgColor: {
        switch (variant) {
            case "success": return
                Qt.rgba(Theme.success.r, Theme.success.g, Theme.success.b, 0.15)
            case "warning": return
                Qt.rgba(Theme.warning.r, Theme.warning.g, Theme.warning.b, 0.15)
            case "error": return
                Qt.rgba(Theme.error.r, Theme.error.g, Theme.error.b, 0.15)
            case "info": return
                Qt.rgba(Theme.info.r, Theme.info.g, Theme.info.b, 0.15)
            default: return
                Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.15)
        }
    }

    readonly property color _textColor: {
        switch (variant) {
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error": return Theme.error
            case "info": return Theme.info
            default: return Theme.text
        }
    }

    color: _bgColor
    radius: 4

    implicitWidth: label.implicitWidth + 8
    implicitHeight: label.implicitHeight + 4

    Text {
        id: label
        anchors.centerIn: parent
        color: root._textColor
        font.pixelSize: 14
        font.letterSpacing: 0.25
    }
}

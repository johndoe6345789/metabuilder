import QtQuick
import QmlComponents 1.0

/**
 * CBadge.qml - Material Design 3 Badge
 *
 * Small: 6px dot indicator, no text
 * Standard: 16px height pill with count/text, radius 8
 * Large: 20px for bigger counts
 *
 * MD3 default color: Theme.error (notification badge)
 */
Rectangle {
    id: root

    property string text: ""
    property bool accent: false
    property color badgeColor: accent ? Theme.primary : Theme.error
    property int count: 0
    property bool dot: false
    // primary, success, warning, error (legacy compat)
    property string variant: "primary"

    // Resolve badge color from variant or explicit color
    readonly property color _bgColor: {
        if (accent) return Theme.primary
        switch (variant) {
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error": return Theme.error
            default: return badgeColor
        }
    }

    // MD3: white text on badge, dark text on warning
    readonly property color _textColor: variant === "warning"
        ? "#000000" : "#ffffff"

    // Display string
    readonly property string _displayText: {
        if (text !== "") return text
        if (count > 99) return "99+"
        return count.toString()
    }

    readonly property bool _showText: !dot && (text !== "" || count > 0)

    Accessible.role: Accessible.StaticText
    Accessible.name: text || count.toString()

    // MD3 small badge: 6px dot, standard badge: 16px pill
    width: dot ? 6 : Math.max(16, label.implicitWidth + 8)
    height: dot ? 6 : 16
    radius: dot ? 3 : 8
    color: _bgColor

    Text {
        id: label
        anchors.centerIn: parent
        text: root._displayText
        color: root._textColor
        font.pixelSize: 11
        font.weight: Font.Bold
        visible: root._showText
    }
}

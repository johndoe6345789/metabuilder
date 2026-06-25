import QtQuick
import QmlComponents 1.0

/**
 * CStatusBadge.qml - Material Design 3 Status Pill
 *
 * Status indicator pill with tonal background matching the status color.
 * Statuses: completed/success, running/info, queued/warning, failed/error,
 // unknown/neutral
 */
Rectangle {
    id: badge

    // completed, running, queued, failed, unknown, success, warning, error,
    // info
    property string status: "unknown"
    property string text: status
    property bool showDot: true
    property var themeColors: ({})

    // Resolve status to a semantic category
    readonly property string _semantic: {
        switch (status) {
            case "completed":
            case "success":   return "success"
            case "running":
            case "info":      return "info"
            case "queued":
            case "warning":   return "warning"
            case "failed":
            case "error":     return "error"
            default:          return "neutral"
        }
    }

    // MD3 status colors with theme fallbacks
    readonly property color _statusColor: {
        switch (_semantic) {
            case "success": return themeColors.success || Theme.success
            case "info":    return themeColors.info    || Theme.info
            case "warning": return themeColors.warning || Theme.warning
            case "error":   return themeColors.error   || Theme.error
            default:        return themeColors.mid     || Theme.textSecondary
        }
    }

    // MD3 tonal background: 12% opacity of status color
    readonly property color _bgColor:
        Qt.rgba(_statusColor.r, _statusColor.g, _statusColor.b, 0.12)

    // MD3 on-container text: full status color
    readonly property color _textColor: _statusColor

    Accessible.role: Accessible.StaticText
    Accessible.name: text + " (" + status + ")"

    implicitHeight: 24
    implicitWidth: badgeRow.implicitWidth + 20
    radius: 12 // Full pill for status badges

    color: _bgColor

    Row {
        id: badgeRow
        anchors.centerIn: parent
        spacing: 6

        // Status dot indicator
        Rectangle {
            anchors.verticalCenter: parent.verticalCenter
            width: 6
            height: 6
            radius: 3
            color: badge._textColor
            visible: badge.showDot

            // Pulse animation for running/active status
            SequentialAnimation on opacity {
                running: badge._semantic === "info" && badge.showDot
                loops: Animation.Infinite
                NumberAnimation { to: 0.3; duration: 600
                easing.type: Easing.InOutSine }
                NumberAnimation { to: 1.0; duration: 600
                easing.type: Easing.InOutSine }
            }
        }

        Text {
            text: badge.text
            font.pixelSize: 12
            font.weight: Font.Medium
            font.letterSpacing: 0.2
            color: badge._textColor
            textFormat: Text.PlainText
        }
    }
}

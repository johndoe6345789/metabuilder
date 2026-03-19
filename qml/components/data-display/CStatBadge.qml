import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CStatBadge.qml - Material Design 3 Statistic Badge
 *
 * Large stat display with label, value, and optional icon.
 * Uses tonal surface container following MD3 color system.
 */
Rectangle {
    id: root

    property string label: ""
    property string value: ""
    property string icon: ""
    // default, primary, success, warning, error
    property string variant: "default"
    property string size: "md" // sm, md, lg

    // MD3 tonal surface container colors
    readonly property color _bgColor: {
        switch (variant) {
            case "primary": return
                Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
            case "success": return
                Qt.rgba(Theme.success.r, Theme.success.g, Theme.success.b, 0.12)
            case "warning": return
                Qt.rgba(Theme.warning.r, Theme.warning.g, Theme.warning.b, 0.12)
            case "error":   return
                Qt.rgba(Theme.error.r, Theme.error.g, Theme.error.b, 0.12)
            default:        return Theme.surfaceVariant
        }
    }

    // MD3 on-container text color
    readonly property color _accentColor: {
        switch (variant) {
            case "primary": return Theme.primary
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error":   return Theme.error
            default:        return Theme.text
        }
    }

    readonly property color _labelColor: {
        switch (variant) {
            case "default": return Theme.textSecondary
            default:        return Qt.darker(_accentColor, 1.1)
        }
    }

    // Size config
    readonly property var _sizes: ({
        sm: { padding: 12, valueSize: 20, labelSize: 11, iconSize: 20,
            spacing: 2 },
        md: { padding: 16, valueSize: 28, labelSize: 13, iconSize: 28,
            spacing: 4 },
        lg: { padding: 20, valueSize: 36, labelSize: 15, iconSize: 36,
            spacing: 6 }
    })

    readonly property var _config: _sizes[size] || _sizes.md

    Accessible.role: Accessible.StaticText
    Accessible.name: label + ": " + value

    color: _bgColor
    radius: 12 // MD3 medium container radius

    implicitWidth: contentRow.implicitWidth + _config.padding * 2
    implicitHeight: contentRow.implicitHeight + _config.padding * 2

    RowLayout {
        id: contentRow
        anchors.centerIn: parent
        spacing: StyleVariables.spacingSm

        // Icon
        Text {
            text: root.icon
            font.pixelSize: root._config.iconSize
            color: root._accentColor
            visible: root.icon !== ""
            Layout.alignment: Qt.AlignVCenter
        }

        ColumnLayout {
            spacing: root._config.spacing

            // Value - large prominent text
            Text {
                text: root.value
                color: root._accentColor
                font.pixelSize: root._config.valueSize
                font.weight: Font.Bold
                font.letterSpacing: -0.5
            }

            // Label - smaller secondary text
            Text {
                text: root.label
                color: root._labelColor
                font.pixelSize: root._config.labelSize
                font.weight: Font.Medium
                visible: root.label !== ""
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CChip.qml - Material Design 3 Chip
 *
 * Variants:
 *   assist   - Outlined, transparent fill
 *   filter   - Tonal fill when selected
 *   input    - Outlined with close icon
 *   suggestion - Outlined, like assist
 *
 * Status variants (legacy compat):
 *   success, warning, error, info, primary
 */
Rectangle {
    id: chip

    Accessible.role: Accessible.Button
    Accessible.name: text
    objectName: "chip_" + text.toLowerCase()
        .replace(/ /g, "_")

    property string text: ""
    property string icon: ""
    // assist, filter, input, suggestion,
    // success, warning, error, info,
    // primary, outlined
    property string variant: "assist"
    property string size: "md" // sm, md
    property bool clickable: false
    property bool closable: false
    property bool checked: false
    property bool selected: false
    property color chipColor: Theme.primary

    signal clicked()
    signal closeClicked()

    // MD3: 32px height
    implicitHeight: 32
    implicitWidth:
        chipRow.implicitWidth + _paddingH * 2

    readonly property real _paddingH:
        size === "sm" ? 12 : 16

    // MD3: 8px radius (not full pill)
    radius: 8

    // Resolve effective color for status
    readonly property color _resolvedColor: {
        switch (variant) {
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error": return Theme.error
            case "info": return Theme.info
            case "primary": return Theme.primary
            default: return chipColor
        }
    }

    readonly property bool _isStatusVariant: {
        return variant === "success"
            || variant === "warning"
            || variant === "error"
            || variant === "info"
            || variant === "primary"
    }

    // MD3 fill logic
    color: {
        // Status variants: tonal fill
        if (_isStatusVariant) {
            return Qt.rgba(
                _resolvedColor.r,
                _resolvedColor.g,
                _resolvedColor.b, 0.12)
        }
        switch (variant) {
            case "filter":
                if (selected || checked) {
                    return Qt.rgba(
                        _resolvedColor.r,
                        _resolvedColor.g,
                        _resolvedColor.b,
                        0.12)
                }
                return "transparent"
            case "assist":
            case "input":
            case "suggestion":
            case "outlined":
            default:
                return "transparent"
        }
    }

    // MD3 border
    border.width: {
        if (_isStatusVariant) return 0
        if (variant === "filter"
            && (selected || checked))
            return 0
        return 1
    }
    border.color: {
        if (_isStatusVariant)
            return _resolvedColor
        return Theme.border
    }

    // MD3 text/icon color
    readonly property color _contentColor: {
        if (_isStatusVariant)
            return _resolvedColor
        if (variant === "filter"
            && (selected || checked))
            return _resolvedColor
        return Theme.text
    }

    Behavior on color {
        ColorAnimation {
            duration: StyleVariables.transitionFast
        }
    }
    Behavior on border.width {
        NumberAnimation {
            duration: StyleVariables.transitionFast
        }
    }

    // Hover/press overlay
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        color: chip._contentColor
        opacity: mouseArea.containsPress
            ? 0.12
            : mouseArea.containsMouse
                ? 0.08 : 0
        Behavior on opacity {
            NumberAnimation { duration: 100 }
        }
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: chip.clickable
        cursorShape: chip.clickable
            ? Qt.PointingHandCursor
            : Qt.ArrowCursor
        onClicked: {
            if (chip.clickable) chip.clicked()
        }
    }

    RowLayout {
        id: chipRow
        anchors.centerIn: parent
        spacing: StyleVariables.spacingXs

        // Leading icon
        Text {
            text: chip.icon
            font.pixelSize: 18
            color: chip._contentColor
            visible: chip.icon !== ""
        }

        // Check icon for selected filter
        Text {
            text: "\u2713"
            font.pixelSize: 14
            font.weight: Font.Bold
            color: chip._contentColor
            visible: chip.variant === "filter"
                && (chip.selected
                    || chip.checked)
        }

        // Label
        Text {
            text: chip.text
            font.pixelSize: 13
            font.weight: Font.Medium
            color: chip._contentColor
        }

        // Close/remove icon
        Rectangle {
            width: 18
            height: 18
            radius: 9
            color: closeMouseArea.containsMouse
                ? Qt.rgba(
                    chip._contentColor.r,
                    chip._contentColor.g,
                    chip._contentColor.b,
                    0.12)
                : "transparent"
            visible: chip.closable
                || chip.variant === "input"

            Text {
                anchors.centerIn: parent
                text: "\u2715"
                font.pixelSize: 11
                font.weight: Font.Medium
                color: chip._contentColor
            }

            MouseArea {
                id: closeMouseArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape:
                    Qt.PointingHandCursor
                onClicked: chip.closeClicked()
            }
        }
    }
}

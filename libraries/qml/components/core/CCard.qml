import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Effects
import QmlComponents 1.0

/**
 * CCard.qml - Material Design 3 Card component
 *
 * Variants:
 *   "filled"   (default) - surfaceContainerHigh fill, subtle border
 *   "outlined" - transparent fill, Theme.border stroke
 *   "elevated" - surface color + drop shadow
 */
Rectangle {
    id: card

    // ── Public API (preserved) ──────────────
    property string title: ""
    property string subtitle: ""
    property bool elevated: false
    property bool hoverable: false
    property bool clickable: false
    property string variant: "filled"  // filled, outlined, elevated

    signal clicked()

    default property alias cardContent: contentColumn.data

    // ── MD3 surface tints ──────────────
    readonly property bool isDark: Theme.mode === "dark"

    readonly property color surfaceContainer:
        isDark
            ? Qt.rgba(1, 1, 1, 0.05)
            : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color surfaceContainerHigh:
        isDark
            ? Qt.rgba(1, 1, 1, 0.08)
            : Qt.rgba(0.31, 0.31, 0.44, 0.10)

    Accessible.role: Accessible.Pane
    Accessible.name: title

    // Geometry
    radius: 12
    clip: true
    implicitWidth: 300
    implicitHeight: contentColumn.implicitHeight

    // ── Fill colour per variant ────────────
    color: {
        switch (variant) {
            case "outlined": return "transparent"
            case "elevated":  return Theme.surface
            default:          return surfaceContainerHigh   // filled
        }
    }

    // Border
    border.width: variant === "elevated" ? 0 : 1
    border.color: {
        if ((hoverable || clickable)
                && mouseArea.containsMouse)
            return Qt.rgba(
                Theme.primary.r,
                Theme.primary.g,
                Theme.primary.b, 0.5)
        if (variant === "outlined") return Theme.border
        // filled: subtle border
        return isDark
            ? Qt.rgba(1, 1, 1, 0.06)
            : Qt.rgba(0, 0, 0, 0.08)
    }

    Behavior on border.color {
        ColorAnimation {
            duration: StyleVariables.transitionFast
        }
    }
    Behavior on color {
        ColorAnimation {
            duration: StyleVariables.transitionFast
        }
    }

    // Hover overlay
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        color: {
            var active = (card.hoverable
                || card.clickable)
                && mouseArea.containsMouse
            return active
                ? StyleMixins.hoverBg(card.isDark)
                : "transparent"
        }

        Behavior on color {
            ColorAnimation {
                duration: StyleVariables.transitionFast
            }
        }
    }

    // ── Elevation (shadow) ──────────────
    layer.enabled: elevated
        || variant === "elevated"
    layer.effect: MultiEffect {
        shadowEnabled: true
        shadowColor:
            StyleVariables.shadowMd.color
        shadowBlur:
            StyleVariables.shadowMd.blur
        shadowVerticalOffset:
            StyleVariables.shadowMd.offset
    }

    // Interaction
    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: card.hoverable
            || card.clickable
        cursorShape: card.clickable
            ? Qt.PointingHandCursor
            : Qt.ArrowCursor
        onClicked: {
            if (card.clickable) card.clicked()
        }
    }

    // ── Content column with MD3 16px padding ──
    ColumnLayout {
        id: contentColumn
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 16
        spacing: 0
    }
}

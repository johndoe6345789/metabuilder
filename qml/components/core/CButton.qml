import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CButton.qml - Material Design 3 button component
 *
 * Variants:
 *   primary   - Filled button (pill, Theme.primary bg, white text)
 *   default   - Tonal button (pill, 12% primary tint bg)
 *   secondary - Tonal button (pill, 12% primary tint bg)
 *   ghost     - Outlined button (pill, border, transparent bg)
 *   outlined  - Outlined button (alias for ghost)
 *   text      - Text button (no border, no bg, colored text)
 *   danger    - Filled danger button (pill, Theme.error bg)
 */
Button {
    id: control

    Accessible.role: Accessible.Button
    Accessible.name: text || "Button"
    Accessible.description: ""
    activeFocusOnTab: true
    objectName: "btn_" + text.toLowerCase()
        .replace(/ /g, "_")

    // default, primary, secondary,
    // ghost, outlined, danger, text
    property string variant: "default"
    property string size: "md" // sm, md, lg
    property string iconSource: ""
    property string iconText: ""
    property bool loading: false

    readonly property string _effectiveIcon: iconText || iconSource

    // MD3 sizing: sm=32, md=40, lg=48
    implicitHeight: {
        switch (size) {
            case "sm": return 32
            case "lg": return 48
            default: return 40
        }
    }

    implicitWidth: Math.max(
        implicitHeight,
        contentRow.implicitWidth + _paddingH * 2
    )

    readonly property int _paddingH: {
        switch (size) {
            case "sm": return 16
            case "lg": return 28
            default: return 24
        }
    }

    font.pixelSize: 14
    font.weight: Font.DemiBold

    // Resolve variant type: filled/outlined/tonal/text
    readonly property bool _isFilled:
        variant === "primary" || variant === "danger"
    readonly property bool _isOutlined:
        variant === "ghost" || variant === "outlined"
    readonly property bool _isText: variant === "text"
    readonly property bool _isTonal:
        variant === "default"
        || variant === "secondary"

    // Base fill color (before state layers)
    readonly property color _baseFill: {
        if (variant === "primary") return Theme.primary
        if (variant === "danger") return Theme.error
        if (_isTonal) return Qt.rgba(
            Theme.primary.r,
            Theme.primary.g,
            Theme.primary.b, 0.12)
        return "transparent" // ghost, outlined, text
    }

    // Foreground / text color
    readonly property color _foreground: {
        if (!enabled) return Theme.textDisabled
        if (variant === "primary") return "#ffffff"
        if (variant === "danger") return "#ffffff"
        return Theme.primary
    }

    opacity: enabled ? 1.0 : 0.38
    Behavior on opacity {
        NumberAnimation {
            duration: Theme.transitionShortest
        }
    }

    background: Rectangle {
        radius: control.height / 2

        // State layer: hover=8%, pressed=12%
        readonly property color _stateLayer: {
            if (control._isFilled)
                return "#ffffff"
            return Theme.primary
        }

        color: {
            if (!control.enabled) {
                if (control._isFilled) return Theme.surface
                return "transparent"
            }
            if (control.down) {
                if (control._isFilled)
                    return Qt.rgba(
                        _stateLayer.r,
                        _stateLayer.g,
                        _stateLayer.b, 0.12)
                if (control._isTonal)
                    return Qt.rgba(
                        Theme.primary.r,
                        Theme.primary.g,
                        Theme.primary.b, 0.22)
                return Qt.rgba(
                    Theme.primary.r,
                    Theme.primary.g,
                    Theme.primary.b, 0.12)
            }
            if (control.hovered) {
                if (control._isFilled)
                    return control._baseFill
                if (control._isTonal)
                    return Qt.rgba(
                        Theme.primary.r,
                        Theme.primary.g,
                        Theme.primary.b, 0.18)
                return Qt.rgba(
                    Theme.primary.r,
                    Theme.primary.g,
                    Theme.primary.b, 0.08)
            }
            return control._baseFill
        }

        border.width: control._isOutlined ? 1 : 0
        border.color: control.enabled
            ? Theme.border
            : Theme.actionDisabled

        Behavior on color {
            ColorAnimation {
                duration: Theme.transitionShortest
            }
        }

        // State layer overlay for filled buttons
        Rectangle {
            anchors.fill: parent
            radius: parent.radius
            visible: control._isFilled
                && control.enabled
                && (control.hovered
                    || control.down)
            color: control.variant === "danger"
                ? "#000000" : "#ffffff"
            opacity: control.down
                ? 0.12
                : (control.hovered ? 0.08 : 0)

            Behavior on opacity {
                NumberAnimation {
                    duration: Theme.transitionShortest
                }
            }
        }
    }

    contentItem: Item {
        implicitWidth: contentRow.implicitWidth
        implicitHeight: contentRow.implicitHeight

        RowLayout {
            id: contentRow
            anchors.centerIn: parent
            spacing: 8

            BusyIndicator {
                Layout.preferredWidth: 16
                Layout.preferredHeight: 16
                running: control.loading
                visible: control.loading
            }

            Text {
                visible: control._effectiveIcon !== "" && !control.loading
                text: control._effectiveIcon
                font.pixelSize: control.font.pixelSize
                color: control._foreground
            }

            Text {
                text: control.text
                font: control.font
                color: control._foreground
            }
        }
    }
}

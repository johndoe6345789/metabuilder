import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CIconButton.qml - Material Design 3 Icon Button
 *
 * MD3 icon button: 40px circle, transparent background, hover/press state
 // layers.
 * Variants:
 *   default - transparent bg, icon in textSecondary, hover state layer
 *   primary - transparent bg, icon in primary, hover state layer in primary
     tint
 *   ghost   - same as default (backward compat)
 */
Item {
    id: control

    Accessible.role: Accessible.Button
    Accessible.name: tooltip || icon || "Button"
    Accessible.description: ""
    activeFocusOnTab: true
    objectName: "btn_" + (tooltip || icon)
        .toLowerCase().replace(/ /g, "_")

    property string icon: ""
    property string size: "md" // sm, md, lg
    property string variant: "default" // default, primary, ghost
    property bool loading: false
    property string tooltip: ""

    signal clicked()

    width: size === "sm" ? 32 : size === "lg" ? 48 : 40
    height: width

    opacity: enabled ? 1.0 : 0.38
    Behavior on opacity {
        NumberAnimation { duration: Theme.transitionShortest } }

    Rectangle {
        id: bg
        anchors.fill: parent
        radius: width / 2
        color: "transparent"

        Behavior on color {
            ColorAnimation { duration: Theme.transitionShortest } }

        // State layer overlay
        Rectangle {
            id: stateLayer
            anchors.fill: parent
            radius: parent.radius
            color: control.variant === "primary"
                ? Theme.primary
                : (Theme.mode === "dark" ? "#ffffff" : "#000000")
            opacity: {
                if (!control.enabled) return 0
                if (mouseArea.pressed) return 0.12
                if (mouseArea.containsMouse) return 0.08
                return 0
            }
            visible: opacity > 0

            Behavior on opacity {
                NumberAnimation { duration: Theme.transitionShortest } }
        }
    }

    BusyIndicator {
        anchors.centerIn: parent
        width: parent.width * 0.5
        height: width
        running: control.loading
        visible: control.loading
    }

    Text {
        anchors.centerIn: parent
        text: control.icon
        font.pixelSize: control.size === "sm"
            ? 16 : control.size === "lg" ? 24 : 20
        font.weight: Font.DemiBold
        color: {
            if (!control.enabled) return Theme.textDisabled
            if (control.variant === "primary") return Theme.primary
            return Theme.textSecondary
        }
        visible: !control.loading
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: control.clicked()
    }

    ToolTip.visible: tooltip && mouseArea.containsMouse
    ToolTip.text: tooltip
    ToolTip.delay: 500
}

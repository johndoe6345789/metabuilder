import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CTextField.qml - Material Design 3 outlined text field
 *
 * Outlined variant with floating label, prefix/suffix icons,
 * error state, and clearable support.
 */
TextField {
    id: control

    property string label: ""
    property string helper: ""
    property string errorText: ""
    property bool hasError: errorText.length > 0
    property string prefixIcon: ""
    property string suffixIcon: ""
    property bool clearable: false
    property string size: "md" // "sm", "md", "lg"

    // Accessibility
    Accessible.role: Accessible.EditableText
    Accessible.name: label || placeholderText || ""
    Accessible.description: helper || ""
    activeFocusOnTab: true
    objectName: "input_"
        + (label || "field")
            .toLowerCase().replace(/ /g, "_")

    signal suffixClicked()

    implicitHeight: size === "sm"
        ? 40
        : (size === "lg" ? 56 : 48)
    leftPadding: prefixIcon ? 40 : 16
    rightPadding:
        (clearable && text.length > 0)
            || suffixIcon ? 40 : 16
    topPadding:
        label && (activeFocus || text.length > 0)
            ? 18 : 0
    verticalAlignment: TextInput.AlignVCenter

    font.pixelSize: 14
    font.family: Theme.fontFamily
    color: enabled
        ? Theme.text : Theme.textDisabled
    placeholderTextColor: Theme.textSecondary
    selectionColor: Theme.primary
    selectedTextColor: Theme.primaryContrastText

    background: Rectangle {
        id: bg
        radius: 8
        color: control.activeFocus
            ? Qt.rgba(
                Theme.primary.r,
                Theme.primary.g,
                Theme.primary.b, 0.04)
            : "transparent"
        border.width: control.activeFocus
            ? 2 : 1
        border.color: {
            if (!control.enabled) return Theme.actionDisabled
            if (control.hasError) return Theme.error
            if (control.activeFocus) return Theme.primary
            if (bgMouseArea.containsMouse)
                return Theme.text
            return Theme.border
        }

        Behavior on border.color {
            ColorAnimation {
                duration: Theme.transitionShortest
            }
        }
        Behavior on border.width {
            NumberAnimation {
                duration: Theme.transitionShortest
            }
        }
        Behavior on color {
            ColorAnimation {
                duration: Theme.transitionShortest
            }
        }

        // Hover detection for the background area
        MouseArea {
            id: bgMouseArea
            anchors.fill: parent
            hoverEnabled: true
            acceptedButtons: Qt.NoButton
            cursorShape: Qt.IBeamCursor
        }

        // Floating label
        Text {
            id: floatingLabel
            text: control.label
            visible: control.label.length > 0
            font.pixelSize:
                (control.activeFocus
                    || control.text.length > 0)
                ? 11 : 14
            font.family: Theme.fontFamily
            font.weight: Font.Medium
            color: {
                if (!control.enabled) return Theme.textDisabled
                if (control.hasError) return Theme.error
                if (control.activeFocus) return Theme.primary
                return Theme.textSecondary
            }

            x: control.prefixIcon ? 40 : 16
            y: (control.activeFocus
                    || control.text.length > 0)
                ? 6
                : (parent.height - height) / 2

            Behavior on y {
                NumberAnimation {
                    duration: Theme.transitionShortest
                    easing.type: Easing.OutCubic
                }
            }
            Behavior on font.pixelSize {
                NumberAnimation {
                    duration: Theme.transitionShortest
                    easing.type: Easing.OutCubic
                }
            }
            Behavior on color {
                ColorAnimation {
                    duration: Theme.transitionShortest
                }
            }
        }

        // Prefix icon
        Text {
            anchors.left: parent.left
            anchors.leftMargin: 12
            anchors.verticalCenter: parent.verticalCenter
            text: control.prefixIcon
            font.pixelSize: 18
            color: {
                if (!control.enabled) return Theme.textDisabled
                if (control.activeFocus) return Theme.primary
                return Theme.textSecondary
            }
            visible: control.prefixIcon.length > 0

            Behavior on color {
                ColorAnimation {
                    duration: Theme.transitionShortest
                }
            }
        }

        // Suffix / clear button
        Text {
            id: suffixText
            anchors.right: parent.right
            anchors.rightMargin: 12
            anchors.verticalCenter: parent.verticalCenter
            text: control.clearable
                    && control.text.length > 0
                ? "\u2715"
                : control.suffixIcon
            font.pixelSize: 16
            color: {
                if (!control.enabled) return Theme.textDisabled
                if (clearMouseArea.containsMouse)
                    return Theme.text
                return Theme.textSecondary
            }
            visible:
                (control.clearable
                    && control.text.length > 0)
                || control.suffixIcon.length > 0

            MouseArea {
                id: clearMouseArea
                anchors.fill: parent
                anchors.margins: -8
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    if (control.clearable
                            && control.text.length > 0) {
                        control.text = ""
                    } else {
                        control.suffixClicked()
                    }
                }
            }
        }
    }

    // Helper / error text below the field
    Text {
        id: helperText
        parent: control.parent
        x: control.x + 16
        y: control.y + control.height + 4
        text: control.hasError
            ? control.errorText
            : control.helper
        font.pixelSize: 11
        font.family: Theme.fontFamily
        color: control.hasError
            ? Theme.error
            : Theme.textSecondary
        visible: text.length > 0
    }
}

import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CFormLabel.qml - Material Design 3 form label
 * 12px medium-weight label with focus, error, and required states
 */
Text {
    id: label

    property alias text: label.text
    property bool required: false
    property bool focused: false
    property bool error: false
    property bool disabled: false

    text: "Label"

    color: {
        if (disabled) return Theme.textDisabled
        if (error) return Theme.error
        if (focused) return Theme.primary
        return Theme.textSecondary
    }

    font.pixelSize: 12
    font.weight: Font.Medium
    font.family: Theme.fontFamily
    opacity: disabled ? 0.38 : 1

    // Append required asterisk via overlay to keep text property clean
    Text {
        anchors.left: parent.right
        anchors.baseline: parent.baseline
        text: " *"
        color: Theme.error
        font.pixelSize: 12
        font.weight: Font.Medium
        font.family: Theme.fontFamily
        visible: label.required
    }

    Behavior on color {
        ColorAnimation { duration: Theme.transitionShortest }
    }
}

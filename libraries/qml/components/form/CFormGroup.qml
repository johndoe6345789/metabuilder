import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CFormGroup.qml - Material Design 3 form field container
 * Groups label, input, and helper/error text with MD3 spacing
 */
ColumnLayout {
    id: root

    property string label: ""
    property string helperText: ""
    property string errorText: ""
    property bool required: false
    property bool disabled: false
    property bool focused: false

    default property alias content: contentArea.data

    spacing: 0

    // Label
    RowLayout {
        Layout.fillWidth: true
        Layout.bottomMargin: 4
        spacing: 0
        visible: root.label !== ""

        Text {
            text: root.label
            color: {
                if (root.disabled) return Theme.textDisabled
                if (root.errorText) return Theme.error
                if (root.focused) return Theme.primary
                return Theme.textSecondary
            }
            font.pixelSize: 12
            font.weight: Font.Medium
            font.family: Theme.fontFamily

            Behavior on color {
                ColorAnimation { duration: Theme.transitionShortest }
            }
        }

        Text {
            text: " *"
            color: Theme.error
            font.pixelSize: 12
            font.weight: Font.Medium
            font.family: Theme.fontFamily
            visible: root.required
        }
    }

    // Content slot (for input)
    Item {
        id: contentArea
        Layout.fillWidth: true
        implicitHeight: childrenRect.height
    }

    // Helper or error text
    Text {
        Layout.fillWidth: true
        Layout.topMargin: 4
        text: root.errorText || root.helperText
        color: root.errorText ? Theme.error : Theme.textSecondary
        font.pixelSize: 12
        font.family: Theme.fontFamily
        visible: text !== ""
        wrapMode: Text.Wrap
        opacity: root.disabled ? 0.38 : 1

        Behavior on color {
            ColorAnimation { duration: Theme.transitionShortest }
        }
    }
}

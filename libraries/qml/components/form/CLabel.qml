import QtQuick
import QmlComponents 1.0

/**
 * CLabel.qml - Material Design 3 simple text label
 * 14px body label associated with a form control
 */
Text {
    id: root

    property string size: "md"           // sm, md, lg
    property bool required: false
    property bool disabled: false
    property Item control: null

    color: disabled ? Theme.textDisabled : Theme.text
    opacity: disabled ? 0.38 : 1

    font.pixelSize: {
        switch (size) {
            case "sm": return 12
            case "lg": return 16
            default: return 14
        }
    }
    font.weight: Font.Normal
    font.family: Theme.fontFamily

    // Append asterisk for required fields
    text: text + (required ? " *" : "")

    // Clicking the label focuses the associated control
    MouseArea {
        anchors.fill: parent
        cursorShape: root.control ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: {
            if (root.control && root.control.forceActiveFocus) {
                root.control.forceActiveFocus()
            }
        }
    }
}

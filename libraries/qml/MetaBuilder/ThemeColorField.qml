import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

RowLayout {
    id: root
    Layout.fillWidth: true
    spacing: 10

    property string label: ""
    property string colorValue: "#000000"
    signal colorEdited(string val)

    Rectangle {
        width: 32
        height: 32
        radius: 6
        color: root.colorValue
        border.width: 1
        border.color: Theme.border

        Rectangle {
            anchors.fill: parent
            anchors.margins: 1
            radius: 5
            color: "transparent"
            border.width: 1
            border.color: Qt.darker(root.colorValue, 1.4)
            z: -1
        }
    }

    CTextField {
        Layout.fillWidth: true
        label: root.label
        placeholderText: "#RRGGBB"
        text: root.colorValue
        onTextChanged: {
            if (/^#[0-9a-fA-F]{6}$/.test(text)) {
                root.colorEdited(text)
            }
        }
    }
}

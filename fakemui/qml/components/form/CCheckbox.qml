import QtQuick
import QtQuick.Controls

/**
 * CCheckbox.qml - styled checkbox wrapper
 */
Rectangle {
    id: root
    property bool checked: false
    property bool indeterminate: false
    property alias text: label.text
    signal toggled(bool checked)

    width: 120
    height: 28
    color: "transparent"

    Row {
        anchors.fill: parent
        spacing: StyleVariables.spacingSm
        anchors.verticalCenter: parent.verticalCenter

        Rectangle {
            id: box
            width: 18
            height: 18
            radius: 3
            color: checked ? Theme.primary : Theme.surfaceVariant
            border.color: Theme.divider
            border.width: 1

            Text {
                anchors.centerIn: parent
                text: indeterminate ? "-" : (checked ? "✓" : "")
                color: Theme.onPrimary
                font.pixelSize: 12
            }

            MouseArea { anchors.fill: parent; onClicked: { root.checked = !root.checked; root.toggled(root.checked) } }
        }

        Text {
            id: label
            text: "Checkbox"
            color: Theme.onSurface
            font.pixelSize: StyleVariables.fontSizeSm
            anchors.verticalCenter: parent.verticalCenter
        }
    }
}

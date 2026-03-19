import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "dropdownExpandedList"
    Accessible.role: Accessible.List
    Accessible.name: "Dropdown options list"

    property var options: []

    Layout.fillWidth: true
    Layout.preferredHeight: optionsList.implicitHeight + 8
    color: Theme.surface
    border.color: Theme.border
    border.width: 1
    radius: 4

    ColumnLayout {
        id: optionsList
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 4
        spacing: 0

        Repeater {
            model: root.options

            Rectangle {
                id: optItem
                Layout.fillWidth: true
                Layout.preferredHeight: 36
                color: optMouse.containsMouse || optItem.activeFocus
                    ? Theme.primary : "transparent"
                opacity: optMouse.containsMouse
                    || optItem.activeFocus ? 0.12 : 1.0
                radius: 2
                activeFocusOnTab: true
                Accessible.role: Accessible.MenuItem
                Accessible.name: modelData.label
                    + " (" + modelData.value + ")"

                Keys.onReturnPressed: optMouse.clicked(null)
                Keys.onSpacePressed: optMouse.clicked(null)

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 8

                    CText {
                        variant: "body1"
                        text: modelData.label
                        Layout.fillWidth: true
                    }
                    CText {
                        variant: "caption"
                        text: modelData.value
                        color: Theme.text
                        opacity: 0.4
                    }
                }

                MouseArea {
                    id: optMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: optItem.forceActiveFocus()
                }
            }
        }
    }
}

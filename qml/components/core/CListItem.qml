import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../theming"

Rectangle {
    id: listItem

    Accessible.role: Accessible.ListItem
    Accessible.name: title
    activeFocusOnTab: true
    objectName: "listitem_" + title.toLowerCase()
        .replace(/ /g, "_")

    property string title: ""
    property string subtitle: ""
    property string caption: ""
    property string leadingIcon: ""
    property string trailingText: ""
    property string trailingIcon: ""
    property bool selected: false
    property bool showDivider: true
    property alias trailing: trailingLoader.sourceComponent

    signal clicked()
    signal trailingClicked()

    implicitHeight: subtitle || caption ? 56 : 48
    radius: 0
    color: "transparent"

    // MD3 state layer
    Rectangle {
        anchors.fill: parent
        radius: 0

        color: {
            if (listItem.selected)
                return Qt.rgba(Theme.primary.r, Theme.primary.g,
                    Theme.primary.b, 0.12)
            if (mouseArea.containsMouse)
                return Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.08)
            return "transparent"
        }

        Behavior on color { ColorAnimation { duration: 150 } }
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: listItem.clicked()
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 16

        // Leading element area (40px)
        Rectangle {
            Layout.preferredWidth: 40
            Layout.preferredHeight: 40
            Layout.alignment: Qt.AlignVCenter
            radius: 20
            color:
                Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
            visible: listItem.leadingIcon !== ""

            Text {
                anchors.centerIn: parent
                text: listItem.leadingIcon
                font.pixelSize: 18
                color: Theme.primary
            }
        }

        // Content
        ColumnLayout {
            id: contentColumn
            Layout.fillWidth: true
            Layout.alignment: Qt.AlignVCenter
            spacing: 2

            Text {
                Layout.fillWidth: true
                text: listItem.title
                font.pixelSize: 14
                font.weight: Font.Normal
                color: listItem.selected ? Theme.primary : Theme.text
                elide: Text.ElideRight
            }

            Text {
                Layout.fillWidth: true
                text: listItem.subtitle
                font.pixelSize: 12
                color: Theme.textSecondary
                elide: Text.ElideRight
                visible: listItem.subtitle !== ""
            }

            Text {
                Layout.fillWidth: true
                text: listItem.caption
                font.pixelSize: 11
                color: Theme.textMuted
                elide: Text.ElideRight
                visible: listItem.caption !== ""
            }
        }

        // Trailing text
        Text {
            text: listItem.trailingText
            font.pixelSize: 12
            color: Theme.textSecondary
            visible: listItem.trailingText !== ""
        }

        // Trailing custom content
        Loader {
            id: trailingLoader
        }

        // Trailing icon
        Text {
            text: listItem.trailingIcon
            font.pixelSize: 16
            color: trailingMouseArea.containsMouse
                ? Theme.text : Theme.textSecondary
            visible: listItem.trailingIcon !== ""

            Behavior on color { ColorAnimation { duration: 150 } }

            MouseArea {
                id: trailingMouseArea
                anchors.fill: parent
                anchors.margins: -8
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    mouse.accepted = true
                    listItem.trailingClicked()
                }
            }
        }
    }

    // Divider
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.leftMargin: listItem.leadingIcon !== "" ? 72 : 16
        anchors.rightMargin: 16
        height: 1
        color: Theme.border
        opacity: 0.5
        visible: listItem.showDivider
    }
}

import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property var fieldData: ({})
    property int fieldIndex: 0
    property bool isSelected: false

    signal clicked()

    width: parent ? parent.width : 400
    height: 40
    radius: 4
    color: root.isSelected
        ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
        : (fieldMouse.containsMouse ? Theme.surface : "transparent")

    MouseArea {
        id: fieldMouse
        anchors.fill: parent
        hoverEnabled: true
        onClicked: root.clicked()
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 8

        CText {
            variant: "body2"
            text: root.fieldData.name || ""
            Layout.preferredWidth: 140
            font.bold: root.isSelected
        }
        CChip {
            text: root.fieldData.type || ""
            Layout.preferredWidth: 100
        }
        CText {
            variant: "body2"
            text: root.fieldData.required ? "Yes" : "No"
            color: root.fieldData.required ? Theme.primary : Theme.border
            Layout.preferredWidth: 80
        }
        CText {
            variant: "caption"
            text: root.fieldData.defaultValue || "-"
            Layout.fillWidth: true
            elide: Text.ElideRight
        }
    }
}

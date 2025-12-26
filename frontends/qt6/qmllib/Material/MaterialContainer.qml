import QtQuick 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: container
    color: "transparent"
    radius: 12
    border.width: 0
    width: parent ? parent.width : 640
    property real maxWidth: 1040
    anchors.horizontalCenter: parent ? parent.horizontalCenter : undefined
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12
        default property alias content: data
    }
}

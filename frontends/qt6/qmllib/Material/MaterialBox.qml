import QtQuick 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: box
    property alias content: layout.data
    color: "transparent"
    radius: 10
    border.width: 0

    ColumnLayout {
        id: layout
        anchors.fill: parent
        anchors.margins: 8
        spacing: 10
    }
}

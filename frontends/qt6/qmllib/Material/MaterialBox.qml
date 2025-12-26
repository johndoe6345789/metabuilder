import QtQuick 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: box
    property alias content: layout.data
    property bool horizontal: false
    color: "transparent"
    radius: 8

    Item {
        anchors.fill: parent
        Layout.fillWidth: true
        Layout.fillHeight: true
    }

    ColumnLayout {
        id: layout
        anchors.fill: parent
        spacing: 8
        visible: !horizontal
    }

    RowLayout {
        id: rowLayout
        anchors.fill: parent
        spacing: 8
        visible: horizontal
        default property alias data: rowLayout.data
    }
}

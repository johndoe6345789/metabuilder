import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: collapse
    property bool expanded: false
    property Component contentComponent
    color: "transparent"

    Loader {
        id: loader
        anchors.fill: parent
        sourceComponent: expanded ? contentComponent : null
    }

    height: expanded ? loader.implicitHeight : 0
    Behavior on height { NumberAnimation { duration: 200; easing.type: Easing.OutQuad } }
}

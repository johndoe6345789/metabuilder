import QtQuick 2.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: progress
    property real value: 0
    property real minValue: 0
    property real maxValue: 1
    implicitHeight: 6
    width: parent ? parent.width : 160
    radius: 3
    color: MaterialPalette.surfaceVariant

    Rectangle {
        anchors.verticalCenter: parent.verticalCenter
        y: (parent.height - height) / 2
        height: parent.height
        width: ((progress.value - progress.minValue) / Math.max(0.0001, progress.maxValue - progress.minValue)) * parent.width
        radius: 3
        color: MaterialPalette.primary
    }
}

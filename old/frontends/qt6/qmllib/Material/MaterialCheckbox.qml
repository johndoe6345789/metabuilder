import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

CheckBox {
    id: checkbox
    property alias label: labelText.text
    property color checkColor: MaterialPalette.primary
    indicator: Rectangle {
        width: 18
        height: 18
        radius: 4
        border.color: checkbox.checked ? checkColor : MaterialPalette.outline
        border.width: 1
        color: checkbox.checked ? checkColor : MaterialPalette.surfaceVariant
        Text {
            anchors.centerIn: parent
            text: checkbox.checked ? "✓" : ""
            font.pixelSize: 14
            color: "#fff"
        }
    }

    Text {
        id: labelText
        text: ""
        anchors.left: indicator.right
        anchors.leftMargin: 8
        verticalAlignment: Text.AlignVCenter
        color: MaterialPalette.onSurface
        font.pixelSize: 14
    }
}

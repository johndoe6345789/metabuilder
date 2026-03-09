import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: skeleton
    property bool animated: true
    property color baseColor: MaterialPalette.surfaceVariant
    property color highlightColor: MaterialPalette.surface
    radius: 8
    color: baseColor
    implicitWidth: 120
    implicitHeight: 20

    Rectangle {
        id: shimmer
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: Qt.rgba(highlightColor.r, highlightColor.g, highlightColor.b, 0) }
            GradientStop { position: 0.5; color: highlightColor }
            GradientStop { position: 1.0; color: Qt.rgba(highlightColor.r, highlightColor.g, highlightColor.b, 0) }
        }
        opacity: animated ? 1 : 0
        Behavior on x {
            NumberAnimation {
                duration: 1100
                from: -width
                to: width
                loops: Animation.Infinite
                easing.type: Easing.InOutQuad
            }
        }
    }
}

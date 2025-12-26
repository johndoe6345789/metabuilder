import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: skeleton
    property alias width: root.width
    property alias height: root.height
    property bool animated: true
    property color baseColor: MaterialPalette.surfaceVariant
    property color highlightColor: MaterialPalette.surface

    color: baseColor
    radius: 8
    implicitWidth: 120
    implicitHeight: 20

    Gradient {
        id: gradient
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: baseColor }
            GradientStop { position: 0.5; color: highlightColor }
            GradientStop { position: 1.0; color: baseColor }
        }
        opacity: animated ? 1 : 0
    }

    Behavior on gradient.y {
        NumberAnimation { duration: 900; repeat: Animation.Infinite; from: 0; to: width }
    }
}

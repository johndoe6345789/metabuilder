import QtQuick
import QmlComponents 1.0

/**
 * CCodeInline.qml - Material Design 3 inline code
 * Small inline code snippet with subtle background
 */
Rectangle {
    id: root

    property alias text: label.text
    property alias textColor: label.color

    color: Theme.surface
    radius: 4

    implicitWidth: label.implicitWidth + 8
    implicitHeight: label.implicitHeight + 4

    Text {
        id: label
        anchors.centerIn: parent
        color: Theme.text
        font.family: Theme.fontFamilyMono
        font.pixelSize: 13
    }
}

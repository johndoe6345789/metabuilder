import QtQuick

/**
 * CFab.qml - Floating action button
 */
Rectangle {
    id: root
    property alias icon: iconLabel.text
    property int size: 56
    signal clicked()

    width: size
    height: size
    radius: size/2
    color: Theme.primary
    anchors.margins: StyleVariables.spacingMd

    Text {
        id: iconLabel
        anchors.centerIn: parent
        text: "+"
        color: Theme.onPrimary
        font.pixelSize: size * 0.5
    }

    MouseArea { anchors.fill: parent; onClicked: root.clicked() }
}

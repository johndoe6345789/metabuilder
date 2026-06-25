import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CFab.qml - Material Design 3 Floating Action Button
 *
 * MD3 FAB: 56px, rounded corner (radius 16), tonal surface with primary icon.
 * Hover adds 8% state layer, press adds 12% state layer.
 */
Rectangle {
    id: root

    Accessible.role: Accessible.Button
    Accessible.name: icon || "Button"
    Accessible.description: ""
    activeFocusOnTab: true
    objectName: "btn_" + (icon || "fab")
        .toLowerCase().replace(/ /g, "_")

    property alias icon: iconLabel.text
    property int size: 56

    signal clicked()

    width: size
    height: size
    radius: 16
    anchors.margins: StyleVariables.spacingMd

    // MD3 tonal surface: primary at 12% opacity over surface
    color: Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)

    Behavior on color { ColorAnimation { duration: Theme.transitionShortest } }

    // State layer overlay for hover/press
    Rectangle {
        id: stateLayer
        anchors.fill: parent
        radius: parent.radius
        color: Theme.primary
        opacity: mouseArea.pressed ? 0.12 : (mouseArea.containsMouse ? 0.08 : 0)
        visible: opacity > 0

        Behavior on opacity {
            NumberAnimation { duration: Theme.transitionShortest } }
    }

    Text {
        id: iconLabel
        anchors.centerIn: parent
        text: "+"
        color: Theme.primary
        font.pixelSize: root.size * 0.43
        font.weight: Font.DemiBold
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }
}

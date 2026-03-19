import QtQuick
import QmlComponents 1.0

/**
 * CRadio.qml - Material Design 3 styled radio button
 *
 * MD3 spec: 20px outer circle, 2px border, 10px inner dot
 * with scale animation on selection.
 */
Rectangle {
    id: root

    property bool checked: false
    property alias text: label.text
    property bool enabled: true

    // Accessibility
    Accessible.role: Accessible.RadioButton
    Accessible.name: text
    Accessible.checked: checked
    activeFocusOnTab: true

    signal toggled(bool checked)

    width: row.implicitWidth
    height: 40
    color: "transparent"

    Row {
        id: row
        spacing: StyleVariables.spacingSm
        anchors.verticalCenter: parent.verticalCenter

        // Ripple touch target
        Item {
            width: 40; height: 40

            // Hover/press ripple
            Rectangle {
                id: ripple
                anchors.centerIn: parent
                width: 40; height: 40
                radius: 20
                color: root.checked ? Qt.rgba(Theme.primary.r, Theme.primary.g,
                    Theme.primary.b, 0.08)
                                    : Qt.rgba(Theme.text.r, Theme.text.g,
                                        Theme.text.b, 0.08)
                opacity: mouseArea.containsMouse || mouseArea.pressed ? 1 : 0
                Behavior on opacity { NumberAnimation { duration: 150 } }
            }

            // Outer circle
            Rectangle {
                id: outerCircle
                anchors.centerIn: parent
                width: 20; height: 20
                radius: 10
                color: "transparent"
                border.width: 2
                border.color: root.checked ? Theme.primary : Theme.border
                opacity: root.enabled ? 1.0 : 0.38

                Behavior on border.color { ColorAnimation { duration: 200
                easing.type: Easing.OutCubic } }

                // Inner filled dot
                Rectangle {
                    id: innerDot
                    anchors.centerIn: parent
                    width: 10; height: 10
                    radius: 5
                    color: Theme.primary
                    opacity: root.enabled ? 1.0 : 0.38
                    scale: root.checked ? 1.0 : 0.0
                    visible: scale > 0

                    Behavior on scale {
                        NumberAnimation {
                            duration: 200
                            easing.type: Easing.OutCubic
                        }
                    }
                }
            }

            MouseArea {
                id: mouseArea
                anchors.fill: parent
                hoverEnabled: true
                enabled: root.enabled
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    root.checked = true;
                    root.toggled(true);
                }
            }
        }

        Text {
            id: label
            text: "Option"
            color: root.enabled ? Theme.text : Theme.textDisabled
            font.pixelSize: StyleVariables.fontSizeSm
            font.family: Theme.fontFamily
            anchors.verticalCenter: parent.verticalCenter
        }
    }
}

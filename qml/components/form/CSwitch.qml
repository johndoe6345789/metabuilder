import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CSwitch.qml - MD3 styled toggle switch
 *
 * MD3 spec: 52x32 pill track, 24px thumb
 * (28px when pressed), animated slide and
 * color transitions.
 */
Rectangle {
    id: root

    property bool checked: false
    property alias text: label.text
    property bool enabled: true

    // Accessibility
    Accessible.role: Accessible.CheckBox
    Accessible.name: text
    Accessible.checked: checked
    activeFocusOnTab: true
    objectName: "switch_"
        + text.toLowerCase().replace(/ /g, "_")

    signal toggled(bool checked)

    width: row.implicitWidth
    height: 40
    color: "transparent"

    Row {
        id: row
        spacing: StyleVariables.spacingSm
        anchors.verticalCenter: parent.verticalCenter

        // Track + thumb container
        Item {
            width: 52; height: 32
            anchors.verticalCenter:
                parent.verticalCenter

            // Track
            Rectangle {
                id: track
                anchors.fill: parent
                radius: 16
                color: root.checked
                    ? Theme.primary
                    : Theme.surface
                border.color: root.checked
                    ? "transparent"
                    : Theme.border
                border.width: root.checked ? 0 : 2
                opacity: root.enabled ? 1.0 : 0.38

                Behavior on color {
                    ColorAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }
                Behavior on border.color {
                    ColorAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }
            }

            // Thumb
            Rectangle {
                id: thumb
                property int thumbSize:
                    mouseArea.pressed ? 28 : 24
                width: thumbSize
                height: thumbSize
                radius: thumbSize / 2
                color: root.checked
                    ? "#ffffff" : Theme.border
                y: (parent.height - height) / 2
                x: root.checked
                    ? (parent.width - width - 4)
                    : 4
                opacity: root.enabled ? 1.0 : 0.38

                // Elevation shadow for thumb
                layer.enabled: true
                layer.effect: null

                Behavior on x {
                    NumberAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }
                Behavior on width {
                    NumberAnimation {
                        duration: 100
                        easing.type: Easing.OutCubic
                    }
                }
                Behavior on height {
                    NumberAnimation {
                        duration: 100
                        easing.type: Easing.OutCubic
                    }
                }
                Behavior on color {
                    ColorAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }
            }

            // Hover state circle around thumb
            Rectangle {
                id: hoverIndicator
                width: 40; height: 40
                radius: 20
                color: root.checked
                    ? Qt.rgba(
                        Theme.primary.r,
                        Theme.primary.g,
                        Theme.primary.b, 0.08)
                    : Qt.rgba(
                        Theme.text.r,
                        Theme.text.g,
                        Theme.text.b, 0.08)
                opacity: mouseArea.containsMouse
                    || mouseArea.pressed ? 1 : 0
                x: thumb.x
                    + (thumb.width / 2)
                    - (width / 2)
                y: thumb.y
                    + (thumb.height / 2)
                    - (height / 2)

                Behavior on opacity {
                    NumberAnimation { duration: 150 }
                }
                Behavior on x {
                    NumberAnimation {
                        duration: 200
                        easing.type: Easing.OutCubic
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
                    root.checked = !root.checked;
                    root.toggled(root.checked);
                }
            }
        }

        Text {
            id: label
            text: ""
            color: root.enabled
                ? Theme.text
                : Theme.textDisabled
            font.pixelSize:
                StyleVariables.fontSizeSm
            font.family: Theme.fontFamily
            anchors.verticalCenter:
                parent.verticalCenter
            visible: text.length > 0
        }
    }
}

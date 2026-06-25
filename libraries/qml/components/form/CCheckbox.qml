import QtQuick
import QtQuick.Controls
import QmlComponents 1.0

/**
 * CCheckbox.qml - Material Design 3 styled checkbox
 *
 * MD3 spec: 18px box, 2px border, slight rounding (radius 2),
 * animated fill on check, white checkmark via Canvas.
 */
Rectangle {
    id: root

    property bool checked: false
    property bool indeterminate: false
    property alias text: label.text
    property bool enabled: true

    // Accessibility
    Accessible.role: Accessible.CheckBox
    Accessible.name: text
    Accessible.checked: checked
    activeFocusOnTab: true
    objectName: "checkbox_"
        + text.toLowerCase().replace(/ /g, "_")

    signal toggled(bool checked)

    width: row.implicitWidth
    height: 40
    color: "transparent"

    Row {
        id: row
        spacing: StyleVariables.spacingSm
        anchors.verticalCenter: parent.verticalCenter

        // Ripple touch target (40x40 centered on 18px box)
        Item {
            width: 40
            height: 40

            // Hover/press ripple circle
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

            // The checkbox box
            Rectangle {
                id: box
                anchors.centerIn: parent
                width: 18; height: 18
                radius: 2
                color: root.checked || root.indeterminate
                    ? Theme.primary : "transparent"
                border.color: root.checked || root.indeterminate
                    ? Theme.primary : Theme.border
                border.width: 2
                opacity: root.enabled ? 1.0 : 0.38

                Behavior on color { ColorAnimation { duration: 200
                easing.type: Easing.OutCubic } }
                Behavior on border.color { ColorAnimation { duration: 200
                easing.type: Easing.OutCubic } }

                // Checkmark drawn via Canvas
                Canvas {
                    id: checkCanvas
                    anchors.centerIn: parent
                    width: 12; height: 12
                    visible: root.checked || root.indeterminate
                    opacity: visible ? 1 : 0

                    Behavior on opacity { NumberAnimation { duration: 150 } }

                    onPaint: {
                        var ctx = getContext("2d");
                        ctx.clearRect(0, 0, width, height);
                        ctx.strokeStyle = "#ffffff";
                        ctx.lineWidth = 2;
                        ctx.lineCap = "round";
                        ctx.lineJoin = "round";

                        if (root.indeterminate) {
                            // Horizontal dash for indeterminate
                            ctx.beginPath();
                            ctx.moveTo(2, height / 2);
                            ctx.lineTo(width - 2, height / 2);
                            ctx.stroke();
                        } else {
                            // Checkmark path
                            ctx.beginPath();
                            ctx.moveTo(1, height * 0.5);
                            ctx.lineTo(width * 0.38, height - 2);
                            ctx.lineTo(width - 1, 2);
                            ctx.stroke();
                        }
                    }

                    Connections {
                        target: root
                        function onCheckedChanged(
                            ) { checkCanvas.requestPaint() }
                        function onIndeterminateChanged(
                            ) { checkCanvas.requestPaint() }
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
            text: "Checkbox"
            color: root.enabled ? Theme.text : Theme.textDisabled
            font.pixelSize: StyleVariables.fontSizeSm
            font.family: Theme.fontFamily
            anchors.verticalCenter: parent.verticalCenter
        }
    }
}

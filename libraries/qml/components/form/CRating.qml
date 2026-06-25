import QtQuick
import QmlComponents 1.0

/**
 * CRating.qml - Material Design 3 styled star rating
 *
 * Interactive star rating with hover preview, unicode stars,
 * and themed colors (primary for filled, border for empty).
 */
Row {
    id: root

    property int value: 0
    property int max: 5
    property bool readOnly: false
    property int hoverValue: -1
    // MD3 amber / override with Theme.primary if desired
    property color filledColor: "#ffc107"
    property color emptyColor: Theme.border

    // Accessibility
    Accessible.role: Accessible.Slider
    Accessible.name: "Rating"
    Accessible.value: value

    signal valueChanged(int newValue)

    spacing: 4

    Repeater {
        model: root.max

        delegate: Item {
            id: starItem
            width: 32; height: 32

            property bool isFilled: {
                if (root.hoverValue >= 0)
                    return index < root.hoverValue;
                return index < root.value;
            }

            Text {
                id: starText
                anchors.centerIn: parent
                text: starItem.isFilled ? "\u2605" : "\u2606"
                font.pixelSize: 24
                color: starItem.isFilled ? root.filledColor : root.emptyColor

                Behavior on color { ColorAnimation { duration: 150 } }

                // Scale bump on hover
                scale: starMouseArea.containsMouse ? 1.2 : 1.0
                Behavior on scale { NumberAnimation { duration: 100
                easing.type: Easing.OutCubic } }
            }

            MouseArea {
                id: starMouseArea
                anchors.fill: parent
                hoverEnabled: !root.readOnly
                enabled: !root.readOnly
                cursorShape: root.readOnly
                    ? Qt.ArrowCursor : Qt.PointingHandCursor

                onClicked: {
                    root.value = index + 1;
                    root.valueChanged(root.value);
                }
                onEntered: {
                    root.hoverValue = index + 1;
                }
                onExited: {
                    root.hoverValue = -1;
                }
            }
        }
    }
}

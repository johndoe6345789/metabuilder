import QtQuick

/**
 * CRating.qml - simple star rating control
 */
Row {
    id: root
    property int value: 0
    property int max: 5
    property bool readOnly: false
    spacing: 4

    Repeater {
        model: root.max
        delegate: Text {
            text: index < root.value ? "★" : "☆"
            font.pixelSize: 18
            color: index < root.value ? Theme.primary : Theme.onSurfaceVariant
            MouseArea { anchors.fill: parent; enabled: !root.readOnly; onClicked: root.value = index+1 }
        }
    }
}

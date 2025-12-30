import QtQuick 2.15
import QtQuick.Controls 2.15

Row {
    id: root
    property int steps: 3
    property int activeIndex: 0
    spacing: 8
    Repeater {
        model: root.steps
        delegate: Rectangle {
            width: 32; height: 32; radius: 16
            color: index === root.activeIndex ? "#1976d2" : "#ddd"
            Text { anchors.centerIn: parent; text: (index+1).toString(); color: index===root.activeIndex?"white":"black" }
        }
    }
}

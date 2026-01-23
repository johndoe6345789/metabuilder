import QtQuick
import QtQuick.Controls

Row {
    id: root
    spacing: 8
    property var items: []
    Repeater {
        model: root.items
        delegate: Row {
            Text { text: modelData }
            Text { text: index < root.items.length-1 ? ">" : ""; color: "#888" }
        }
    }
}

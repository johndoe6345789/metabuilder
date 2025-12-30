import QtQuick 2.15
import QtQuick.Controls 2.15

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

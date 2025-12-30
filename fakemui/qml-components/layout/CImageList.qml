import QtQuick 2.15
import QtQuick.Controls 2.15

GridView {
    id: grid
    property var images: []
    model: images
    cellWidth: 120
    cellHeight: 120
    delegate: Item {
        width: grid.cellWidth; height: grid.cellHeight
        Image { anchors.fill: parent; source: modelData }
    }
}

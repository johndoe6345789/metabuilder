import QtQuick
import QtQuick.Controls

GridView {
    id: autogrid
    property int minCellWidth: 120
    cellWidth: minCellWidth
    cellHeight: minCellWidth
    model: []
    delegate: Item { width: autogrid.cellWidth; height: autogrid.cellHeight }
}

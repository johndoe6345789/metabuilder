import QtQuick 2.15
import QtQuick.Controls 2.15

GridView {
    id: autogrid
    property int minCellWidth: 120
    cellWidth: minCellWidth
    cellHeight: minCellWidth
    model: []
    delegate: Item { width: autogrid.cellWidth; height: autogrid.cellHeight }
}

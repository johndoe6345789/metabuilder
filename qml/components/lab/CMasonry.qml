import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: masonry
    
    property int columns: 4
    property int spacing: 8
    property alias model: repeater.model
    property Component delegate: null
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: {
        var maxHeight = 0
        for (var i = 0; i < columnHeights.length; i++) {
            if (columnHeights[i] > maxHeight) maxHeight = columnHeights[i]
        }
        return maxHeight
    }
    
    property var columnHeights: {
        var heights = []
        for (var i = 0; i < columns; i++) heights.push(0)
        return heights
    }
    
    property real columnWidth: (width - (columns - 1) * spacing) / columns
    
    Repeater {
        id: repeater
        
        delegate: Item {
            id: delegateItem
            
            // Find shortest column
            property int targetColumn: {
                var minCol = 0
                var minHeight = masonry.columnHeights[0] || 0
                for (var i = 1; i < masonry.columns; i++) {
                    var h = masonry.columnHeights[i] || 0
                    if (h < minHeight) {
                        minHeight = h
                        minCol = i
                    }
                }
                return minCol
            }
            
            x: targetColumn * (masonry.columnWidth + masonry.spacing)
            y: masonry.columnHeights[targetColumn] || 0
            width: masonry.columnWidth
            
            Loader {
                id: itemLoader
                width: parent.width
                sourceComponent: masonry.delegate
                
                property var modelData: model
                property int modelIndex: index
                
                onLoaded: {
                    delegateItem.height = item.height
                    // Update column height
                    var heights = masonry.columnHeights.slice()
                    heights[delegateItem.targetColumn] = delegateItem.y + item.height + masonry.spacing
                    masonry.columnHeights = heights
                }
            }
        }
    }
}

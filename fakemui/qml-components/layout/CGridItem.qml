import QtQuick

/**
 * CGridItem.qml - Grid item wrapper for CGrid
 * Provides consistent sizing and optional span properties
 * 
 * Usage:
 *   CGrid {
 *       columns: 3
 *       
 *       CGridItem { Text { text: "Item 1" } }
 *       CGridItem { colSpan: 2; Text { text: "Wide item" } }
 *       CGridItem { Text { text: "Item 3" } }
 *   }
 */
Item {
    id: root
    
    // Public properties
    property int colSpan: 1    // Number of columns to span
    property int rowSpan: 1    // Number of rows to span
    property string align: ""  // Override alignment: start, center, end, stretch
    
    // Content slot
    default property alias content: contentItem.data
    
    // Layout properties for GridLayout
    Layout.columnSpan: colSpan
    Layout.rowSpan: rowSpan
    Layout.fillWidth: true
    Layout.fillHeight: rowSpan > 1
    
    Layout.alignment: {
        switch (align) {
            case "start": return Qt.AlignLeft | Qt.AlignTop
            case "center": return Qt.AlignHCenter | Qt.AlignVCenter
            case "end": return Qt.AlignRight | Qt.AlignBottom
            default: return Qt.AlignLeft | Qt.AlignTop
        }
    }
    
    // Size based on content
    implicitHeight: contentItem.implicitHeight
    implicitWidth: contentItem.implicitWidth
    
    // Content wrapper
    Item {
        id: contentItem
        anchors.fill: parent
        implicitWidth: childrenRect.width
        implicitHeight: childrenRect.height
    }
}

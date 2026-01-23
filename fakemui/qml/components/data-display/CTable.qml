import QtQuick
import QtQuick.Layouts

/**
 * CTable.qml - Data table (mirrors _table.scss)
 * Simple table with headers and rows
 */
Rectangle {
    id: root
    
    property var headers: []             // Array of header strings
    property var rows: []                // Array of row arrays
    property var columnWidths: []        // Optional column width ratios
    property bool striped: true
    property bool bordered: true
    
    color: "transparent"
    radius: StyleVariables.radiusSm
    border.width: bordered ? 1 : 0
    border.color: Theme.divider
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: tableCol.implicitHeight
    
    clip: true
    
    ColumnLayout {
        id: tableCol
        anchors.fill: parent
        spacing: 0
        
        // Header row
        Rectangle {
            Layout.fillWidth: true
            implicitHeight: headerRow.implicitHeight
            color: Theme.mode === "dark" ? Qt.rgba(255, 255, 255, 0.08) : Qt.rgba(0, 0, 0, 0.04)
            
            RowLayout {
                id: headerRow
                anchors.fill: parent
                spacing: 0
                
                Repeater {
                    model: root.headers
                    
                    Rectangle {
                        Layout.fillWidth: root.columnWidths.length === 0
                        Layout.preferredWidth: root.columnWidths[index] || -1
                        implicitHeight: headerText.implicitHeight + StyleVariables.spacingSm * 2
                        color: "transparent"
                        border.width: root.bordered && index > 0 ? 1 : 0
                        border.color: Theme.divider
                        
                        Text {
                            id: headerText
                            anchors.fill: parent
                            anchors.margins: StyleVariables.spacingSm
                            text: modelData
                            color: Theme.onSurface
                            font.pixelSize: StyleVariables.fontSizeSm
                            font.weight: Font.DemiBold
                            elide: Text.ElideRight
                            verticalAlignment: Text.AlignVCenter
                        }
                    }
                }
            }
        }
        
        // Data rows
        Repeater {
            model: root.rows
            
            Rectangle {
                Layout.fillWidth: true
                implicitHeight: dataRow.implicitHeight
                color: root.striped && index % 2 === 1 
                    ? (Theme.mode === "dark" ? Qt.rgba(255, 255, 255, 0.02) : Qt.rgba(0, 0, 0, 0.02))
                    : "transparent"
                
                // Top border
                Rectangle {
                    width: parent.width
                    height: root.bordered ? 1 : 0
                    color: Theme.divider
                }
                
                RowLayout {
                    id: dataRow
                    anchors.fill: parent
                    anchors.topMargin: root.bordered ? 1 : 0
                    spacing: 0
                    
                    Repeater {
                        model: modelData
                        
                        Rectangle {
                            Layout.fillWidth: root.columnWidths.length === 0
                            Layout.preferredWidth: root.columnWidths[index] || -1
                            implicitHeight: cellText.implicitHeight + StyleVariables.spacingSm * 2
                            color: "transparent"
                            border.width: root.bordered && index > 0 ? 1 : 0
                            border.color: Theme.divider
                            
                            Text {
                                id: cellText
                                anchors.fill: parent
                                anchors.margins: StyleVariables.spacingSm
                                text: modelData
                                color: Theme.onSurface
                                font.pixelSize: StyleVariables.fontSizeSm
                                elide: Text.ElideRight
                                verticalAlignment: Text.AlignVCenter
                            }
                        }
                    }
                }
            }
        }
    }
}

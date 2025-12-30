import QtQuick

/**
 * CDivider.qml - Divider/separator component (mirrors _divider.scss)
 * Horizontal or vertical line separator
 * 
 * Usage:
 *   CDivider {}                          // Horizontal divider
 *   CDivider { orientation: "vertical" } // Vertical divider
 *   CDivider { text: "OR" }              // Divider with text
 */
Item {
    id: root
    
    // Public properties
    property string orientation: "horizontal"  // horizontal, vertical
    property string text: ""
    property string variant: "fullWidth"       // fullWidth, inset, middle
    property int inset: StyleVariables.spacingLg
    
    // Size
    implicitWidth: orientation === "horizontal" ? 200 : 1
    implicitHeight: orientation === "horizontal" ? (text ? 24 : 1) : 200
    
    // Horizontal divider
    Row {
        visible: root.orientation === "horizontal"
        anchors.fill: parent
        anchors.leftMargin: root.variant === "inset" ? root.inset : (root.variant === "middle" ? root.inset : 0)
        anchors.rightMargin: root.variant === "middle" ? root.inset : 0
        spacing: root.text ? StyleVariables.spacingMd : 0
        
        // Left line
        Rectangle {
            width: root.text ? (parent.width - textLabel.width - StyleVariables.spacingMd * 2) / 2 : parent.width
            height: 1
            anchors.verticalCenter: parent.verticalCenter
            color: Theme.divider
        }
        
        // Text label
        Text {
            id: textLabel
            visible: root.text
            text: root.text
            font.pixelSize: StyleVariables.fontSizeXs
            font.weight: Font.Medium
            color: Theme.textSecondary
            anchors.verticalCenter: parent.verticalCenter
        }
        
        // Right line
        Rectangle {
            visible: root.text
            width: (parent.width - textLabel.width - StyleVariables.spacingMd * 2) / 2
            height: 1
            anchors.verticalCenter: parent.verticalCenter
            color: Theme.divider
        }
    }
    
    // Vertical divider
    Rectangle {
        visible: root.orientation === "vertical"
        width: 1
        height: parent.height
        anchors.horizontalCenter: parent.horizontalCenter
        color: Theme.divider
    }
}

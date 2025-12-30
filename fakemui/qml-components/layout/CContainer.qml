import QtQuick

/**
 * CContainer.qml - Responsive container with max-width (mirrors CSS container)
 * Automatically centers content and applies responsive max-width
 * 
 * Usage:
 *   CContainer {
 *       CGrid {
 *           variant: "responsive"
 *           columnsMobile: 1
 *           columnsDesktop: 3
 *           ...
 *       }
 *   }
 */
Item {
    id: root
    
    // Properties
    property string size: "lg"            // sm, md, lg, xl, full
    property int paddingH: Responsive.isMobile ? StyleVariables.spacingSm : StyleVariables.spacingMd
    property int paddingV: 0
    property bool centerContent: true
    
    // Content slot
    default property alias content: contentItem.data
    
    // Max width based on size
    readonly property int _maxWidth: {
        switch (size) {
            case "sm": return 600
            case "md": return 900
            case "lg": return 1200
            case "xl": return 1536
            case "full": return parent ? parent.width : 99999
            default: return 1200
        }
    }
    
    // Sizing
    implicitWidth: parent ? parent.width : 400
    implicitHeight: contentItem.implicitHeight + (paddingV * 2)
    
    // Content wrapper with max-width
    Item {
        id: contentItem
        width: Math.min(root.width - (root.paddingH * 2), root._maxWidth)
        anchors.horizontalCenter: root.centerContent ? parent.horizontalCenter : undefined
        x: root.centerContent ? undefined : root.paddingH
        y: root.paddingV
        implicitHeight: childrenRect.height
    }
}

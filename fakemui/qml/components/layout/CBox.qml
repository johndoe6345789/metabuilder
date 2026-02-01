import QtQuick

/**
 * CBox.qml - Generic container component (mirrors common SCSS patterns)
 * Flexible container with padding, margin, and styling options
 * 
 * Usage:
 *   CBox { 
 *       padding: "md"
 *       background: "paper"
 *       radius: "sm"
 *       
 *       Text { text: "Content" }
 *   }
 */
Rectangle {
    id: root
    
    // Public properties
    property string padding: "none"    // none, xs, sm, md, lg, xl or number
    property string paddingX: ""       // Horizontal padding override
    property string paddingY: ""       // Vertical padding override
    property string background: "transparent"  // transparent, paper, surface, elevated, primary, or color
    property string radius: "none"     // none, sm, md, lg, full or number
    property string borderColor: ""    // Border color (empty = no border)
    property int borderWidth: 1
    property string shadow: "none"     // none, sm, md, lg
    
    // Content slot
    default property alias content: contentItem.data
    
    // Padding calculations
    readonly property int _paddingH: {
        var p = paddingX || padding
        switch (p) {
            case "none": return 0
            case "xs": return StyleVariables.spacingXs
            case "sm": return StyleVariables.spacingSm
            case "md": return StyleVariables.spacingMd
            case "lg": return StyleVariables.spacingLg
            case "xl": return StyleVariables.spacingXl
            default: return parseInt(p) || 0
        }
    }
    
    readonly property int _paddingV: {
        var p = paddingY || padding
        switch (p) {
            case "none": return 0
            case "xs": return StyleVariables.spacingXs
            case "sm": return StyleVariables.spacingSm
            case "md": return StyleVariables.spacingMd
            case "lg": return StyleVariables.spacingLg
            case "xl": return StyleVariables.spacingXl
            default: return parseInt(p) || 0
        }
    }
    
    // Background color
    color: {
        switch (background) {
            case "transparent": return "transparent"
            case "paper": return Theme.paper
            case "surface": return Theme.surface
            case "elevated": return Theme.surfaceVariant
            case "primary": return Theme.primary
            case "error": return Theme.error
            case "success": return Theme.success
            case "warning": return Theme.warning
            default: return background  // Allow custom color
        }
    }
    
    // Border radius
    radius: {
        switch (root.radius) {
            case "none": return 0
            case "sm": return StyleVariables.radiusSm
            case "md": return StyleVariables.radiusMd
            case "lg": return StyleVariables.radiusLg
            case "full": return StyleVariables.radiusFull
            default: return parseInt(root.radius) || 0
        }
    }
    
    // Border
    border.width: borderColor ? borderWidth : 0
    border.color: {
        switch (borderColor) {
            case "": return "transparent"
            case "default": return Theme.border
            case "divider": return Theme.divider
            case "primary": return Theme.primary
            default: return borderColor
        }
    }
    
    // Size based on content
    implicitWidth: contentItem.implicitWidth + _paddingH * 2
    implicitHeight: contentItem.implicitHeight + _paddingV * 2
    
    // Content wrapper with padding
    Item {
        id: contentItem
        anchors.fill: parent
        anchors.leftMargin: root._paddingH
        anchors.rightMargin: root._paddingH
        anchors.topMargin: root._paddingV
        anchors.bottomMargin: root._paddingV
    }
}

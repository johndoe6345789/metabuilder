import QtQuick
import QtQuick.Layouts

/**
 * FlexCol.qml - Vertical flex container (mirrors SCSS .flex, .flex-col utilities)
 * Simplified ColumnLayout with common flex patterns
 * 
 * Usage:
 *   FlexCol {
 *       Text { text: "Top" }
 *       Text { text: "Bottom" }
 *   }
 *   
 *   FlexCol {
 *       gap: "lg"
 *       align: "center"
 *       ...
 *   }
 */
ColumnLayout {
    id: root
    
    // Public properties
    property string justify: "start"  // start, center, end, space-between
    property string align: "stretch"  // start, center, end, stretch
    property string gap: "sm"         // none, xs, sm, md, lg, xl, or number
    property bool fill: false         // Fill parent height
    
    // Apply gap
    spacing: {
        switch (gap) {
            case "none": return 0
            case "xs": return StyleVariables.spacingXs
            case "sm": return StyleVariables.spacingSm
            case "md": return StyleVariables.spacingMd
            case "lg": return StyleVariables.spacingLg
            case "xl": return StyleVariables.spacingXl
            default: return parseInt(gap) || StyleVariables.spacingSm
        }
    }
    
    // Fill width by default (column behavior)
    Layout.fillWidth: true
    Layout.fillHeight: fill
}

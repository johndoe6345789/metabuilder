import QtQuick
import QtQuick.Layouts

/**
 * FlexRow.qml - Horizontal flex container (mirrors SCSS .flex, .flex-row utilities)
 * Simplified RowLayout with common flex patterns
 * 
 * Usage:
 *   FlexRow {
 *       Text { text: "Left" }
 *       Text { text: "Right" }
 *   }
 *   
 *   FlexRow {
 *       justify: "space-between"
 *       align: "center"
 *       gap: "md"
 *       ...
 *   }
 */
RowLayout {
    id: root
    
    // Public properties
    property string justify: "start"  // start, center, end, space-between, space-around
    property string align: "stretch"  // start, center, end, stretch
    property string gap: "sm"         // none, xs, sm, md, lg, xl, or number
    property bool wrap: false
    property bool fill: true          // Fill parent width
    
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
    
    // Fill width
    Layout.fillWidth: fill
    
    // Note: QML RowLayout doesn't support justify-content directly
    // For space-between, use Spacer {} between items
    // For centering, wrap in Item with anchors.centerIn
}

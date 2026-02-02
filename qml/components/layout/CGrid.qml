import QtQuick
import QtQuick.Layouts

/**
 * CGrid.qml - Responsive grid layout (mirrors _grid.scss)
 * CSS Grid-like component with auto-fill, fixed, and responsive column options
 * 
 * Usage:
 *   // Fixed 3 columns
 *   CGrid {
 *       columns: 3
 *       gap: "md"
 *       
 *       Repeater {
 *           model: 9
 *           Rectangle { ... }
 *       }
 *   }
 *   
 *   // Auto-fill responsive grid (like CSS auto-fill/minmax)
 *   CGrid {
 *       variant: "auto"
 *       minItemWidth: 300
 *       
 *       Repeater { ... }
 *   }
 *
 *   // Responsive columns by breakpoint
 *   CGrid {
 *       variant: "responsive"
 *       columnsMobile: 1
 *       columnsTablet: 2
 *       columnsDesktop: 4
 *   }
 */
Item {
    id: root
    
    // Public properties
    property string variant: "fixed"      // fixed, auto, responsive
    property int columns: 2               // Number of columns (for fixed variant)
    property string gap: "md"             // none, xs, sm, md, lg, xl or number
    property int minItemWidth: 320        // Minimum item width (for auto variant)
    property string align: "stretch"      // start, center, end, stretch
    
    // Responsive columns (for variant: "responsive")
    property int columnsMobile: 1
    property int columnsTablet: 2
    property int columnsDesktop: 4
    
    // Responsive gap
    property string gapMobile: ""         // Override gap on mobile
    property string gapTablet: ""         // Override gap on tablet
    
    // Content slot
    default property alias content: gridContainer.data
    
    // Computed gap value
    readonly property int _gap: {
        // Check responsive gap overrides
        if (Responsive.isMobile && gapMobile) {
            return _parseGap(gapMobile)
        }
        if (Responsive.isTablet && gapTablet) {
            return _parseGap(gapTablet)
        }
        return _parseGap(gap)
    }
    
    function _parseGap(gapValue) {
        switch (gapValue) {
            case "none": return 0
            case "xs": return StyleVariables.spacingXs
            case "sm": return StyleVariables.spacingSm
            case "md": return StyleVariables.spacingMd
            case "lg": return StyleVariables.spacingLg
            case "xl": return StyleVariables.spacingXl
            default: return parseInt(gapValue) || StyleVariables.spacingMd
        }
    }
    
    // Calculate effective columns based on variant
    readonly property int _effectiveColumns: {
        switch (variant) {
            case "auto":
                return Math.max(1, Math.floor((width + _gap) / (minItemWidth + _gap)))
            case "responsive":
                return Responsive.columns(columnsDesktop, columnsMobile, columnsTablet)
            default:
                return columns
        }
    }
    
    // Size
    implicitWidth: parent ? parent.width : 400
    implicitHeight: gridContainer.implicitHeight
    
    GridLayout {
        id: gridContainer
        anchors.fill: parent
        columns: root._effectiveColumns
        rowSpacing: root._gap
        columnSpacing: root._gap
        
        // Note: Children should use Layout.fillWidth: true for proper sizing
    }
}

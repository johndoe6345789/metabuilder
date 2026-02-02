import QtQuick

/**
 * Spacer.qml - Flexible spacer utility (mirrors SCSS spacing utilities)
 * Creates empty space in layouts
 * 
 * Usage:
 *   RowLayout {
 *       Text { text: "Left" }
 *       Spacer {}           // Fills remaining space
 *       Text { text: "Right" }
 *   }
 *   
 *   ColumnLayout {
 *       Text { text: "Top" }
 *       Spacer { size: "lg" }  // Fixed 24px space
 *       Text { text: "Bottom" }
 *   }
 */
Item {
    id: root
    
    // Public properties
    property string size: "flex"  // flex, xs, sm, md, lg, xl, xxl, or number
    property string direction: "auto"  // auto, horizontal, vertical
    
    // Determine if we're in a row or column layout
    readonly property bool _isHorizontal: {
        if (direction === "horizontal") return true
        if (direction === "vertical") return false
        // Auto-detect from parent
        return parent && parent.toString().indexOf("RowLayout") !== -1
    }
    
    // Size calculations
    readonly property int _fixedSize: {
        switch (size) {
            case "xs": return StyleVariables.spacingXs   // 4
            case "sm": return StyleVariables.spacingSm   // 8
            case "md": return StyleVariables.spacingMd   // 16
            case "lg": return StyleVariables.spacingLg   // 24
            case "xl": return StyleVariables.spacingXl   // 32
            case "xxl": return StyleVariables.spacingXxl // 48
            case "flex": return -1
            default: return parseInt(size) || -1
        }
    }
    
    // Layout properties
    Layout.fillWidth: _fixedSize < 0 && _isHorizontal
    Layout.fillHeight: _fixedSize < 0 && !_isHorizontal
    Layout.preferredWidth: _fixedSize >= 0 && _isHorizontal ? _fixedSize : undefined
    Layout.preferredHeight: _fixedSize >= 0 && !_isHorizontal ? _fixedSize : undefined
    
    implicitWidth: _fixedSize >= 0 ? _fixedSize : 0
    implicitHeight: _fixedSize >= 0 ? _fixedSize : 0
}

import QtQuick

/**
 * CText.qml - Styled text component (mirrors SCSS text utilities)
 * Pre-configured text with typography variants and color options
 * 
 * Usage:
 *   CText { text: "Body text" }
 *   CText { variant: "h4"; text: "Heading" }
 *   CText { variant: "caption"; color: "secondary" }
 *   CText { variant: "body2"; mono: true }
 */
Text {
    id: root
    
    // Public properties
    property string variant: "body1"  // h1-h6, subtitle1, subtitle2, body1, body2, caption, overline, button
    property string colorVariant: "primary"  // primary, secondary, disabled, error, success, warning, info
    property bool mono: false
    property bool truncate: false
    
    // Get typography settings from mixins
    readonly property var _typography: StyleMixins.typography(variant)
    
    // Apply typography
    font.pixelSize: _typography.size
    font.weight: _typography.weight
    font.letterSpacing: _typography.spacing
    font.family: mono ? StyleVariables.fontMono : StyleVariables.fontFamily
    
    // Apply color
    color: {
        switch (colorVariant) {
            case "secondary": return Theme.textSecondary
            case "disabled": return Theme.textDisabled
            case "error": return Theme.error
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "info": return Theme.info
            case "inherit": return parent ? parent.color : Theme.text
            default: return Theme.text
        }
    }
    
    // Truncation
    elide: truncate ? Text.ElideRight : Text.ElideNone
    maximumLineCount: truncate ? 1 : undefined
    wrapMode: truncate ? Text.NoWrap : Text.WordWrap
}

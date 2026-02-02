import QtQuick

/**
 * CLabel.qml - Form label (mirrors _label.scss)
 * Styled label for form inputs
 */
Text {
    id: root
    
    property string size: "md"           // sm, md, lg
    property bool required: false
    property bool disabled: false
    
    color: disabled ? Theme.onSurfaceVariant : Theme.onSurface
    opacity: disabled ? 0.6 : 1
    
    font.pixelSize: {
        switch (size) {
            case "sm": return StyleVariables.fontSizeXs
            case "lg": return StyleVariables.fontSizeMd
            default: return StyleVariables.fontSizeSm
        }
    }
    font.weight: Font.Medium
    
    // Append asterisk for required fields
    text: text + (required ? " *" : "")
}

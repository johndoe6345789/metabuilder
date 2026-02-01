import QtQuick

/**
 * CTitle.qml - Title text (mirrors _title.scss)
 * Heading typography component
 */
Text {
    id: root
    
    property string level: "h1"          // h1, h2, h3, h4, h5, h6
    property bool gutterBottom: true     // Add bottom margin
    
    color: Theme.onSurface
    wrapMode: Text.Wrap
    
    // Typography based on level
    font.pixelSize: {
        switch (level) {
            case "h1": return 32
            case "h2": return 28
            case "h3": return 24
            case "h4": return 20
            case "h5": return 18
            case "h6": return 16
            default: return 32
        }
    }
    
    font.weight: {
        switch (level) {
            case "h1": return Font.Bold
            case "h2": return Font.Bold
            case "h3": return Font.DemiBold
            case "h4": return Font.DemiBold
            case "h5": return Font.Medium
            case "h6": return Font.Medium
            default: return Font.Bold
        }
    }
    
    lineHeight: {
        switch (level) {
            case "h1": return 1.2
            case "h2": return 1.25
            case "h3": return 1.3
            default: return 1.4
        }
    }
    
    bottomPadding: gutterBottom ? StyleVariables.spacingSm : 0
}

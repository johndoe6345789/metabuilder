import QtQuick

/**
 * CIcon.qml - Icon container (mirrors _icon.scss)
 * Consistent icon sizing and coloring
 */
Text {
    id: root
    
    property string icon: ""             // Unicode emoji or icon font character
    property string size: "md"           // sm, md, lg, xl
    property color iconColor: Theme.onSurface
    
    // Size mapping
    readonly property int _size: {
        switch (size) {
            case "sm": return 16
            case "lg": return 24
            case "xl": return 32
            default: return 20
        }
    }
    
    text: icon
    color: iconColor
    font.pixelSize: _size
    
    horizontalAlignment: Text.AlignHCenter
    verticalAlignment: Text.AlignVCenter
    
    width: _size
    height: _size
}

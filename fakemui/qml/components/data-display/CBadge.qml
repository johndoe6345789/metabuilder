import QtQuick

/**
 * CBadge.qml - Notification badge (mirrors _badge.scss)
 * Small indicator for counts or status
 */
Rectangle {
    id: root
    
    property string size: "md"           // sm, md, lg
    property string variant: "primary"   // primary, success, warning, error
    property int count: 0                // Number to display (0 = dot only)
    property bool dot: false             // Show as dot without number
    
    // Size mapping
    readonly property var _sizes: ({
        sm: { minWidth: 14, height: 14, fontSize: 9, padding: 3 },
        md: { minWidth: 16, height: 16, fontSize: 10, padding: 4 },
        lg: { minWidth: 20, height: 20, fontSize: 11, padding: 5 }
    })
    
    readonly property var _sizeConfig: _sizes[size] || _sizes.md
    
    // Color mapping
    readonly property color _bgColor: {
        switch (variant) {
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error": return Theme.error
            default: return Theme.primary
        }
    }
    
    readonly property color _textColor: variant === "warning" ? "#000000" : "#ffffff"
    
    // Sizing
    width: dot ? _sizeConfig.height : Math.max(_sizeConfig.minWidth, label.implicitWidth + _sizeConfig.padding * 2)
    height: _sizeConfig.height
    radius: height / 2
    color: _bgColor
    
    // Badge text
    Text {
        id: label
        anchors.centerIn: parent
        text: root.count > 99 ? "99+" : root.count.toString()
        color: root._textColor
        font.pixelSize: root._sizeConfig.fontSize
        font.weight: Font.DemiBold
        visible: !root.dot && root.count > 0
    }
}

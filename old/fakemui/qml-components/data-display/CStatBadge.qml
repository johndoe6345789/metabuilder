import QtQuick
import QtQuick.Layouts

/**
 * CStatBadge.qml - Statistic badge (mirrors _stat-badge.scss)
 * Display a statistic with label
 */
Rectangle {
    id: root
    
    property string label: ""
    property string value: ""
    property string icon: ""
    property string variant: "default"   // default, primary, success, warning, error
    property string size: "md"           // sm, md, lg
    
    // Color mapping
    readonly property color _bgColor: {
        switch (variant) {
            case "primary": return Theme.primaryContainer
            case "success": return Theme.successContainer
            case "warning": return Theme.warningContainer
            case "error": return Theme.errorContainer
            default: return Theme.surfaceVariant
        }
    }
    
    readonly property color _textColor: {
        switch (variant) {
            case "primary": return Theme.primary
            case "success": return Theme.success
            case "warning": return Theme.warning
            case "error": return Theme.error
            default: return Theme.onSurface
        }
    }
    
    // Size config
    readonly property var _sizes: ({
        sm: { padding: StyleVariables.spacingSm, valueSize: StyleVariables.fontSizeLg, labelSize: StyleVariables.fontSizeXs },
        md: { padding: StyleVariables.spacingMd, valueSize: StyleVariables.fontSize2xl, labelSize: StyleVariables.fontSizeSm },
        lg: { padding: StyleVariables.spacingLg, valueSize: 32, labelSize: StyleVariables.fontSizeMd }
    })
    
    readonly property var _config: _sizes[size] || _sizes.md
    
    color: _bgColor
    radius: StyleVariables.radiusMd
    
    implicitWidth: contentRow.implicitWidth + _config.padding * 2
    implicitHeight: contentRow.implicitHeight + _config.padding * 2
    
    RowLayout {
        id: contentRow
        anchors.centerIn: parent
        spacing: StyleVariables.spacingSm
        
        // Icon
        Text {
            text: root.icon
            font.pixelSize: root._config.valueSize
            visible: root.icon !== ""
        }
        
        ColumnLayout {
            spacing: 2
            
            // Value
            Text {
                text: root.value
                color: root._textColor
                font.pixelSize: root._config.valueSize
                font.weight: Font.Bold
            }
            
            // Label
            Text {
                text: root.label
                color: Theme.onSurfaceVariant
                font.pixelSize: root._config.labelSize
                visible: root.label !== ""
            }
        }
    }
}

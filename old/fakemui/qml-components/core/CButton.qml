import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * CButton.qml - Styled button component (mirrors _button.scss)
 * Uses StyleVariables for consistent sizing and spacing
 */
Button {
    id: control
    
    property string variant: "default" // default, primary, secondary, ghost, danger, text
    property string size: "md" // sm, md, lg
    property string iconSource: ""
    property string iconText: "" // Alias for simpler icon usage (emoji/text icons)
    property bool loading: false
    
    // Effective icon: prefer iconText over iconSource
    readonly property string _effectiveIcon: iconText || iconSource
    
    // Use StyleVariables for sizing (mirrors _button.scss)
    implicitHeight: {
        switch (size) {
            case "sm": return StyleVariables.buttonSizes.sm.height
            case "lg": return StyleVariables.buttonSizes.lg.height
            default: return StyleVariables.buttonSizes.md.height
        }
    }
    
    implicitWidth: Math.max(implicitHeight, contentRow.implicitWidth + _paddingH * 2)
    
    readonly property int _paddingH: {
        switch (size) {
            case "sm": return StyleVariables.buttonSizes.sm.paddingH
            case "lg": return StyleVariables.buttonSizes.lg.paddingH
            default: return StyleVariables.buttonSizes.md.paddingH
        }
    }
    
    font.pixelSize: {
        switch (size) {
            case "sm": return StyleVariables.buttonSizes.sm.fontSize
            case "lg": return StyleVariables.buttonSizes.lg.fontSize
            default: return StyleVariables.buttonSizes.md.fontSize
        }
    }
    font.weight: Font.Medium
    
    background: Rectangle {
        radius: StyleVariables.radiusSm
        color: {
            if (!control.enabled) return Theme.surface
            if (control.down) {
                switch(control.variant) {
                    case "primary": return Qt.darker(Theme.primary, 1.3)
                    case "secondary": return Qt.darker(Theme.success, 1.3)
                    case "danger": return Qt.darker(Theme.error, 1.3)
                    case "ghost": 
                    case "text": return StyleMixins.activeBg(Theme.mode === "dark")
                    default: return Qt.darker(Theme.surface, 1.2)
                }
            }
            if (control.hovered) {
                switch(control.variant) {
                    case "primary": return Qt.darker(Theme.primary, 1.1)
                    case "secondary": return Qt.darker(Theme.success, 1.1)
                    case "danger": return Qt.darker(Theme.error, 1.1)
                    case "ghost":
                    case "text": return StyleMixins.hoverBg(Theme.mode === "dark")
                    default: return Qt.lighter(Theme.surface, 1.1)
                }
            }
            switch(control.variant) {
                case "primary": return Theme.primary
                case "secondary": return Theme.success
                case "danger": return Theme.error
                case "ghost": return "transparent"
                case "text": return "transparent"
                default: return Theme.surface
            }
        }
        border.width: control.variant === "ghost" ? 1 : 0
        border.color: Theme.border
        
        Behavior on color { ColorAnimation { duration: StyleVariables.transitionFast } }
    }
    
    contentItem: RowLayout {
        id: contentRow
        spacing: StyleVariables.spacingSm
        
        BusyIndicator {
            Layout.preferredWidth: 16
            Layout.preferredHeight: 16
            running: control.loading
            visible: control.loading
        }
        
        Text {
            visible: control._effectiveIcon && !control.loading
            text: control._effectiveIcon
            font.pixelSize: control.font.pixelSize
            color: control.enabled ? Theme.text : Theme.textDisabled
        }
        
        Text {
            text: control.text
            font: control.font
            color: control.enabled ? Theme.text : Theme.textDisabled
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }
    }
    
    Behavior on opacity { NumberAnimation { duration: StyleVariables.transitionFast } }
    opacity: enabled ? 1.0 : 0.5
}

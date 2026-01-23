import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * CChip.qml - Chip/tag component (mirrors _chip.scss)
 * Uses StyleVariables and StyleMixins for consistent styling
 */
Rectangle {
    id: chip
    
    property string text: ""
    property string icon: ""
    property string variant: "default" // default, success, warning, error, info, primary, outlined
    property string size: "sm" // sm, md
    property bool clickable: false
    property bool closable: false
    
    signal clicked()
    signal closeClicked()
    
    // Use StyleVariables for sizing
    implicitHeight: size === "sm" ? StyleVariables.chipSizes.sm.height : StyleVariables.chipSizes.md.height
    implicitWidth: chipRow.implicitWidth + (size === "sm" ? StyleVariables.chipSizes.sm.paddingH : StyleVariables.chipSizes.md.paddingH) * 2
    radius: StyleVariables.radiusFull
    
    // Use StyleMixins for status colors
    color: {
        if (variant === "outlined") return "transparent"
        switch(variant) {
            case "success": return StyleMixins.statusBgColor("success")
            case "warning": return StyleMixins.statusBgColor("warning")
            case "error": return StyleMixins.statusBgColor("error")
            case "info": return StyleMixins.statusBgColor("info")
            case "primary": return Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.15)
            default: return Theme.surface
        }
    }
    
    border.width: variant === "outlined" ? 1 : 0
    border.color: _chipColor
    
    readonly property color _chipColor: {
        switch(variant) {
            case "success": return StyleMixins.statusColor("success")
            case "warning": return StyleMixins.statusColor("warning")
            case "error": return StyleMixins.statusColor("error")
            case "info": return StyleMixins.statusColor("info")
            case "primary": return Theme.primary
            default: return Theme.textSecondary
        }
    }
    
    Behavior on color { ColorAnimation { duration: StyleVariables.transitionFast } }
    
    MouseArea {
        anchors.fill: parent
        hoverEnabled: chip.clickable
        cursorShape: chip.clickable ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: if (chip.clickable) chip.clicked()
    }
    
    RowLayout {
        id: chipRow
        anchors.centerIn: parent
        spacing: StyleVariables.spacingXs
        
        Text {
            text: chip.icon
            font.pixelSize: size === "sm" ? StyleVariables.chipSizes.sm.fontSize : StyleVariables.chipSizes.md.fontSize
            color: chip._chipColor
            visible: chip.icon
        }
        
        Text {
            text: chip.text
            font.pixelSize: size === "sm" ? StyleVariables.chipSizes.sm.fontSize : StyleVariables.chipSizes.md.fontSize
            font.weight: Font.Medium
            color: chip._chipColor
        }
        
        Text {
            text: "✕"
            font.pixelSize: size === "sm" ? StyleVariables.fontSizeXs : StyleVariables.fontSizeSm
            color: Qt.darker(chip._chipColor, 1.2)
            visible: chip.closable
            
            MouseArea {
                anchors.fill: parent
                anchors.margins: -4
                cursorShape: Qt.PointingHandCursor
                onClicked: chip.closeClicked()
            }
        }
    }
}

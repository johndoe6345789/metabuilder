import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Button {
    id: control
    
    property string variant: "contained" // contained, outlined, text
    property string color: "primary" // primary, secondary, error, warning, info, success
    property string size: "medium" // small, medium, large
    property bool loading: false
    property string loadingPosition: "center" // start, center, end
    property string startIcon: ""
    property string endIcon: ""
    property bool fullWidth: false
    
    enabled: !loading
    
    implicitHeight: {
        switch(size) {
            case "small": return 32
            case "large": return 44
            default: return 36
        }
    }
    implicitWidth: fullWidth ? parent.width : Math.max(implicitHeight, contentRow.implicitWidth + horizontalPadding * 2)
    
    property int horizontalPadding: {
        switch(size) {
            case "small": return 12
            case "large": return 20
            default: return 16
        }
    }
    
    font.pixelSize: size === "small" ? 12 : size === "large" ? 16 : 14
    font.weight: Font.Medium
    
    // Color palette
    property color mainColor: {
        switch(color) {
            case "primary": return "#1976d2"
            case "secondary": return "#9c27b0"
            case "error": return "#d32f2f"
            case "warning": return "#ed6c02"
            case "info": return "#0288d1"
            case "success": return "#2e7d32"
            default: return "#1976d2"
        }
    }
    
    property color darkColor: {
        switch(color) {
            case "primary": return "#1565c0"
            case "secondary": return "#7b1fa2"
            case "error": return "#c62828"
            case "warning": return "#e65100"
            case "info": return "#01579b"
            case "success": return "#1b5e20"
            default: return "#1565c0"
        }
    }
    
    background: Rectangle {
        radius: 4
        color: {
            if (!control.enabled && !control.loading) return "#e0e0e0"
            if (control.loading) return Qt.lighter(control.mainColor, 1.2)
            if (control.variant === "contained") {
                return control.down ? control.darkColor : 
                       control.hovered ? Qt.darker(control.mainColor, 1.1) : control.mainColor
            }
            if (control.variant === "outlined") {
                return control.hovered ? Qt.rgba(control.mainColor.r, control.mainColor.g, control.mainColor.b, 0.04) : "transparent"
            }
            // text variant
            return control.hovered ? Qt.rgba(control.mainColor.r, control.mainColor.g, control.mainColor.b, 0.04) : "transparent"
        }
        border.width: control.variant === "outlined" ? 1 : 0
        border.color: control.enabled || control.loading ? control.mainColor : "#e0e0e0"
        
        Behavior on color { ColorAnimation { duration: 150 } }
    }
    
    contentItem: RowLayout {
        id: contentRow
        spacing: 8
        
        // Start loading indicator
        BusyIndicator {
            Layout.preferredWidth: 16
            Layout.preferredHeight: 16
            running: control.loading && control.loadingPosition === "start"
            visible: control.loading && control.loadingPosition === "start"
            palette.dark: control.variant === "contained" ? "#ffffff" : control.mainColor
        }
        
        // Start icon
        Text {
            visible: control.startIcon && !control.loading
            text: control.startIcon
            font.pixelSize: control.font.pixelSize
            color: control.variant === "contained" ? "#ffffff" : control.mainColor
        }
        
        // Center loading indicator (replaces text)
        BusyIndicator {
            Layout.preferredWidth: 20
            Layout.preferredHeight: 20
            running: control.loading && control.loadingPosition === "center"
            visible: control.loading && control.loadingPosition === "center"
            palette.dark: control.variant === "contained" ? "#ffffff" : control.mainColor
        }
        
        // Button text
        Text {
            visible: !control.loading || control.loadingPosition !== "center"
            text: control.text
            font: control.font
            color: {
                if (!control.enabled && !control.loading) return "#9e9e9e"
                return control.variant === "contained" ? "#ffffff" : control.mainColor
            }
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }
        
        // End icon
        Text {
            visible: control.endIcon && !control.loading
            text: control.endIcon
            font.pixelSize: control.font.pixelSize
            color: control.variant === "contained" ? "#ffffff" : control.mainColor
        }
        
        // End loading indicator
        BusyIndicator {
            Layout.preferredWidth: 16
            Layout.preferredHeight: 16
            running: control.loading && control.loadingPosition === "end"
            visible: control.loading && control.loadingPosition === "end"
            palette.dark: control.variant === "contained" ? "#ffffff" : control.mainColor
        }
    }
    
    Behavior on opacity { NumberAnimation { duration: 150 } }
}

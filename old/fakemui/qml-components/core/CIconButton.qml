import QtQuick
import QtQuick.Controls

Item {
    id: control
    
    property string icon: ""
    property string size: "md" // sm, md, lg
    property string variant: "default" // default, primary, ghost
    property bool loading: false
    property string tooltip: ""
    
    signal clicked()
    
    width: size === "sm" ? 32 : size === "lg" ? 48 : 40
    height: width
    
    Rectangle {
        id: bg
        anchors.fill: parent
        radius: width / 2
        color: {
            if (!control.enabled) return "transparent"
            if (mouseArea.pressed) {
                switch(control.variant) {
                    case "primary": return Qt.darker(Theme.primary, 1.2)
                    default: return "#404040"
                }
            }
            if (mouseArea.containsMouse) {
                switch(control.variant) {
                    case "primary": return Theme.primary
                    default: return "#3d3d3d"
                }
            }
            switch(control.variant) {
                case "primary": return Theme.primary
                case "ghost": return "transparent"
                default: return Theme.surface
            }
        }
        
        Behavior on color { ColorAnimation { duration: 150 } }
    }
    
    BusyIndicator {
        anchors.centerIn: parent
        width: parent.width * 0.5
        height: width
        running: control.loading
        visible: control.loading
    }
    
    Text {
        anchors.centerIn: parent
        text: control.icon
        font.pixelSize: control.size === "sm" ? 14 : control.size === "lg" ? 22 : 18
        color: control.enabled ? (control.variant === "primary" ? "#ffffff" : Theme.textSecondary) : Theme.textDisabled
        visible: !control.loading
    }
    
    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: control.clicked()
    }
    
    ToolTip.visible: tooltip && mouseArea.containsMouse
    ToolTip.text: tooltip
    ToolTip.delay: 500
    
    opacity: enabled ? 1.0 : 0.5
    Behavior on opacity { NumberAnimation { duration: 150 } }
}

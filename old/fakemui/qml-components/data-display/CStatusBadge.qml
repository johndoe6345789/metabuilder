import QtQuick

Rectangle {
    id: badge
    
    property string status: "unknown" // completed, running, queued, failed, unknown
    property string text: status
    property bool showDot: true
    property var themeColors: ({})
    
    // Internal colors with fallbacks
    readonly property var colors: ({
        success: themeColors.success || "#22c55e",
        info: themeColors.info || "#3b82f6",
        warning: themeColors.warning || "#f59e0b",
        error: themeColors.error || "#ef4444",
        neutral: themeColors.mid || "#333333"
    })
    
    implicitHeight: 22
    implicitWidth: badgeRow.implicitWidth + 12
    radius: 4
    
    color: {
        switch(status) {
            case "completed": return colors.success
            case "running": return colors.info
            case "queued": return colors.warning
            case "failed": return colors.error
            default: return colors.neutral
        }
    }
    
    Row {
        id: badgeRow
        anchors.centerIn: parent
        spacing: 6
        
        // Animated dot for running status
        Rectangle {
            anchors.verticalCenter: parent.verticalCenter
            width: 6
            height: 6
            radius: 3
            color: "#ffffff"
            visible: badge.showDot && badge.status === "running"
            
            SequentialAnimation on opacity {
                running: badge.status === "running"
                loops: Animation.Infinite
                NumberAnimation { to: 0.3; duration: 500 }
                NumberAnimation { to: 1.0; duration: 500 }
            }
        }
        
        Text {
            text: badge.text
            font.pixelSize: 11
            font.weight: Font.Medium
            color: "#ffffff"
            textFormat: Text.PlainText
        }
    }
}

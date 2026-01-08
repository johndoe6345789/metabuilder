import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components" as C

Rectangle {
    id: root
    
    property string taskAlias: ""
    property string taskTitle: ""
    property string taskRepo: ""
    property string taskBranch: ""
    property string taskStatus: "unknown"
    property string taskCreated: ""
    property string taskId: ""
    property bool hasPr: false
    property string prUrl: ""
    property bool isSelected: false
    property bool showNerdInfo: false
    property var themeColors
    
    signal clicked()
    signal prClicked()
    
    height: showNerdInfo ? 100 : 80
    radius: 8
    color: isSelected ? (themeColors.highlight || "#1a3a5c") : (mouseArea.containsMouse ? (themeColors.surfaceAlt || themeColors.alternateBase || "#242424") : "transparent")
    border.width: isSelected ? 1 : 0
    border.color: themeColors.accent || "#10a37f"
    
    Behavior on color { ColorAnimation { duration: 150 } }
    Behavior on height { NumberAnimation { duration: 150 } }
    
    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 6
        
        // Top row: alias, title, PR badge
        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            
            // Alias badge
            Rectangle {
                width: aliasText.implicitWidth + 12
                height: 22
                radius: 4
                color: themeColors.accent
                opacity: 0.2
                
                Text {
                    id: aliasText
                    anchors.centerIn: parent
                    text: "#" + taskAlias
                    font.pixelSize: 12
                    font.weight: Font.Bold
                    color: themeColors.accent
                }
            }
            
            Text {
                Layout.fillWidth: true
                text: taskTitle
                font.pixelSize: 14
                font.weight: Font.Medium
                color: themeColors.text
                elide: Text.ElideRight
            }
            
            // PR indicator
            Rectangle {
                width: 24
                height: 24
                radius: 12
                color: themeColors.success || "#22c55e"
                visible: hasPr
                
                Text {
                    anchors.centerIn: parent
                    text: "🔀"
                    font.pixelSize: 12
                }
                
                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        mouse.accepted = true
                        root.prClicked()
                    }
                }
            }
        }
        
        // Nerd mode: task ID
        Text {
            Layout.fillWidth: true
            text: taskId
            font.pixelSize: 9
            font.family: "Menlo"
            color: themeColors.nerd || "#00ff41"
            elide: Text.ElideMiddle
            visible: showNerdInfo && taskId
            opacity: 0.8
        }
        
        // Repo and branch
        RowLayout {
            Layout.fillWidth: true
            spacing: 12
            
            Text {
                text: "📁 " + taskRepo
                font.pixelSize: 12
                color: themeColors.textMuted
                elide: Text.ElideRight
                visible: taskRepo
                Layout.fillWidth: true
            }
            
            Text {
                text: "🌿 " + taskBranch
                font.pixelSize: 11
                color: themeColors.textMuted
                elide: Text.ElideRight
                visible: taskBranch
            }
        }
        
        // Bottom row: status and date
        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            
            C.CStatusBadge {
                status: taskStatus
            }
            
            Item { Layout.fillWidth: true }
            
            Text {
                text: taskCreated
                font.pixelSize: 11
                color: themeColors.textMuted
                opacity: 0.7
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Popup {
    id: popup
    width: 200
    padding: 8
    
    property string currentTheme: "system"
    property var themeColors: ({
        window: "#0d0d0d",
        windowText: "#ffffff",
        base: "#1a1a1a",
        alternateBase: "#242424",
        mid: "#333333",
        accent: "#10a37f",
    })
    
    signal themeSelected(string themeId)
    
    // Theme definitions matching React app
    readonly property var themes: [
        { id: "system", name: "System", icon: "💻", color: "#10a37f" },
        { id: "light", name: "Light", icon: "☀️", color: "#10a37f" },
        { id: "dark", name: "Dark", icon: "🌙", color: "#10a37f" },
        { id: "midnight", name: "Midnight", icon: "🌌", color: "#6366f1" },
        { id: "forest", name: "Forest", icon: "🌲", color: "#22c55e" },
        { id: "ocean", name: "Ocean", icon: "🌊", color: "#0ea5e9" },
        { id: "sunset", name: "Sunset", icon: "🌅", color: "#f97316" },
        { id: "rose", name: "Rose", icon: "🌹", color: "#f43f5e" },
        { id: "highContrast", name: "High Contrast", icon: "🔳", color: "#ffff00" },
    ]
    
    background: Rectangle {
        color: themeColors.base || "#1a1a1a"
        border.color: themeColors.mid || "#333333"
        border.width: 1
        radius: 8
    }
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 4
        
        Label {
            text: "🎨 Theme"
            font.bold: true
            font.pixelSize: 12
            color: themeColors.windowText || "#ffffff"
            Layout.bottomMargin: 4
        }
        
        Repeater {
            model: popup.themes
            
            delegate: ItemDelegate {
                Layout.fillWidth: true
                Layout.preferredHeight: 36
                
                highlighted: modelData.id === popup.currentTheme
                
                background: Rectangle {
                    color: parent.highlighted ? (themeColors.accent || "#10a37f") : (parent.hovered ? (themeColors.alternateBase || "#242424") : "transparent")
                    radius: 4
                }
                
                contentItem: RowLayout {
                    spacing: 8
                    
                    // Color indicator
                    Rectangle {
                        width: 16
                        height: 16
                        radius: 8
                        color: modelData.color
                        border.color: themeColors.mid || "#333333"
                        border.width: 1
                    }
                    
                    Label {
                        text: modelData.icon
                        font.pixelSize: 14
                    }
                    
                    Label {
                        text: modelData.name
                        color: parent.parent.highlighted ? "#ffffff" : (themeColors.windowText || "#ffffff")
                        Layout.fillWidth: true
                    }
                    
                    Label {
                        text: "✓"
                        visible: modelData.id === popup.currentTheme
                        color: "#ffffff"
                    }
                }
                
                onClicked: {
                    popup.themeSelected(modelData.id)
                    popup.close()
                }
            }
        }
    }
}

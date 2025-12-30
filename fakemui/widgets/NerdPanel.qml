import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: colors.background
    
    property string sessionInfo: "{}"
    property alias logText: logArea.text
    property var themeColors: ({})
    
    // Internal colors that map from passed themeColors or use defaults
    readonly property var colors: ({
        background: themeColors.base || themeColors.background || "#1a1a2e",
        surface: themeColors.alternateBase || themeColors.surface || "#252542",
        primary: themeColors.highlight || themeColors.primary || "#4dabf7",
        secondary: themeColors.accent || themeColors.secondary || "#69db7c",
        accent: themeColors.accent || "#ffd43b",
        text: themeColors.text || themeColors.windowText || "#ffffff",
        textMuted: themeColors.textSecondary || themeColors.textMuted || "#888888",
        border: themeColors.mid || themeColors.border || "#3d3d5c",
        success: themeColors.success || "#51cf66",
        warning: themeColors.warning || "#fcc419",
        error: themeColors.error || "#ff6b6b",
        nerd: "#00ff41"
    })
    
    function appendLog(msg) {
        logArea.text = logArea.text + msg + "\n"
        // Auto-scroll to bottom
        logArea.cursorPosition = logArea.length
    }
    
    function clearLogs() {
        logArea.text = ""
    }
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 8
        spacing: 8
        
        // Header
        RowLayout {
            Layout.fillWidth: true
            
            Label {
                text: "🤓 NERD MODE"
                font.bold: true
                font.pixelSize: 14
                color: colors.nerd
                font.family: "Menlo"
            }
            
            Item { Layout.fillWidth: true }
            
            Label {
                text: "API Logs • Session Info • Debug"
                opacity: 0.6
                color: colors.nerd
                font.pixelSize: 11
            }
        }
        
        // Tab bar for different nerd views
        TabBar {
            id: nerdTabs
            Layout.fillWidth: true
            
            background: Rectangle {
                color: Qt.darker(colors.background, 1.2)
            }
            
            TabButton {
                text: "📡 API Log"
                font.pixelSize: 11
                
                background: Rectangle {
                    color: nerdTabs.currentIndex === 0 ? colors.surface : "transparent"
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: nerdTabs.currentIndex === 0 ? colors.nerd : colors.textMuted
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            TabButton {
                text: "🔐 Session"
                font.pixelSize: 11
                
                background: Rectangle {
                    color: nerdTabs.currentIndex === 1 ? colors.surface : "transparent"
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: nerdTabs.currentIndex === 1 ? colors.nerd : colors.textMuted
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            TabButton {
                text: "⌨️ Shortcuts"
                font.pixelSize: 11
                
                background: Rectangle {
                    color: nerdTabs.currentIndex === 2 ? colors.surface : "transparent"
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: nerdTabs.currentIndex === 2 ? colors.nerd : colors.textMuted
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
        
        // Tab content
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: nerdTabs.currentIndex
            
            // API Log tab
            Item {
                ColumnLayout {
                    anchors.fill: parent
                    spacing: 4
                    
                    // Log controls
                    RowLayout {
                        Layout.fillWidth: true
                        
                        Label {
                            text: logArea.text.split('\n').length - 1 + " entries"
                            color: colors.textMuted
                            font.pixelSize: 10
                        }
                        
                        Item { Layout.fillWidth: true }
                        
                        Button {
                            text: "Clear"
                            flat: true
                            font.pixelSize: 10
                            onClicked: {
                                app.clearDebugLogs()
                                root.clearLogs()
                            }
                            
                            contentItem: Text {
                                text: parent.text
                                color: colors.error
                                horizontalAlignment: Text.AlignHCenter
                            }
                            background: Rectangle {
                                color: parent.hovered ? colors.surface : "transparent"
                                radius: 2
                            }
                        }
                        
                        Button {
                            text: "Copy"
                            flat: true
                            font.pixelSize: 10
                            onClicked: app.copyToClipboard(logArea.text)
                            
                            contentItem: Text {
                                text: parent.text
                                color: colors.primary
                                horizontalAlignment: Text.AlignHCenter
                            }
                            background: Rectangle {
                                color: parent.hovered ? colors.surface : "transparent"
                                radius: 2
                            }
                        }
                    }
                    
                    // Log output
                    ScrollView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        clip: true
                        
                        TextArea {
                            id: logArea
                            readOnly: true
                            font.family: "Menlo"
                            font.pixelSize: 11
                            color: colors.nerd
                            selectionColor: colors.nerd
                            selectedTextColor: colors.background
                            wrapMode: Text.NoWrap
                            selectByMouse: true
                            
                            background: Rectangle {
                                color: Qt.darker(colors.background, 1.2)
                                radius: 4
                            }
                            
                            // Syntax highlighting simulation
                            text: ""
                        }
                    }
                }
            }
            
            // Session tab
            Item {
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    
                    ColumnLayout {
                        width: parent.width
                        spacing: 12
                        
                        // Session status
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: sessionCol.implicitHeight + 16
                            color: Qt.darker(colors.background, 1.2)
                            radius: 4
                            
                            ColumnLayout {
                                id: sessionCol
                                anchors.fill: parent
                                anchors.margins: 8
                                spacing: 8
                                
                                Label {
                                    text: "Session Status"
                                    font.bold: true
                                    color: colors.nerd
                                    font.pixelSize: 12
                                }
                                
                                RowLayout {
                                    spacing: 8
                                    
                                    Rectangle {
                                        width: 8
                                        height: 8
                                        radius: 4
                                        color: {
                                            try {
                                                var info = JSON.parse(sessionInfo)
                                                return info.has_session ? colors.success : colors.error
                                            } catch(e) {
                                                return colors.error
                                            }
                                        }
                                    }
                                    
                                    Label {
                                        text: {
                                            try {
                                                var info = JSON.parse(sessionInfo)
                                                return info.has_session ? "Connected" : "Not Connected"
                                            } catch(e) {
                                                return "Unknown"
                                            }
                                        }
                                        color: colors.text
                                        font.pixelSize: 11
                                    }
                                }
                                
                                Label {
                                    text: {
                                        try {
                                            var info = JSON.parse(sessionInfo)
                                            return "Cookie: " + (info.cookie_preview || "N/A")
                                        } catch(e) {
                                            return "Cookie: N/A"
                                        }
                                    }
                                    color: colors.textMuted
                                    font.pixelSize: 10
                                    font.family: "Menlo"
                                }
                                
                                Label {
                                    text: {
                                        try {
                                            var info = JSON.parse(sessionInfo)
                                            return "Base URL: " + (info.base_url || "N/A")
                                        } catch(e) {
                                            return "Base URL: N/A"
                                        }
                                    }
                                    color: colors.textMuted
                                    font.pixelSize: 10
                                    font.family: "Menlo"
                                }
                            }
                        }
                        
                        // Raw session JSON
                        Label {
                            text: "Raw Session Info"
                            font.bold: true
                            color: colors.nerd
                            font.pixelSize: 12
                        }
                        
                        TextArea {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 150
                            text: sessionInfo
                            readOnly: true
                            font.family: "Menlo"
                            font.pixelSize: 10
                            color: colors.primary
                            wrapMode: Text.Wrap
                            selectByMouse: true
                            
                            background: Rectangle {
                                color: Qt.darker(colors.background, 1.2)
                                radius: 4
                            }
                        }
                    }
                }
            }
            
            // Shortcuts tab
            Item {
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    
                    ColumnLayout {
                        width: parent.width
                        spacing: 8
                        
                        Label {
                            text: "Keyboard Shortcuts"
                            font.bold: true
                            color: colors.nerd
                            font.pixelSize: 12
                        }
                        
                        Repeater {
                            model: [
                                { key: "Ctrl+N", action: "New Task" },
                                { key: "Ctrl+R", action: "Refresh Tasks" },
                                { key: "F5", action: "Refresh Tasks" },
                                { key: "Ctrl+T", action: "Toggle Theme" },
                                { key: "Ctrl+`", action: "Toggle Nerd Mode" },
                                { key: "Ctrl+Enter", action: "Send Prompt (in dialog)" },
                                { key: "Escape", action: "Close Dialog" },
                            ]
                            
                            delegate: RowLayout {
                                Layout.fillWidth: true
                                spacing: 16
                                
                                Rectangle {
                                    Layout.preferredWidth: 100
                                    Layout.preferredHeight: 24
                                    color: colors.surface
                                    radius: 4
                                    
                                    Label {
                                        anchors.centerIn: parent
                                        text: modelData.key
                                        color: colors.accent
                                        font.family: "Menlo"
                                        font.pixelSize: 11
                                    }
                                }
                                
                                Label {
                                    text: modelData.action
                                    color: colors.text
                                    font.pixelSize: 11
                                }
                            }
                        }
                        
                        Item { Layout.preferredHeight: 16 }
                        
                        Label {
                            text: "CLI Commands"
                            font.bold: true
                            color: colors.nerd
                            font.pixelSize: 12
                        }
                        
                        TextArea {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 120
                            readOnly: true
                            font.family: "Menlo"
                            font.pixelSize: 10
                            color: colors.primary
                            text: "codex tasks          # List tasks\ncodex task <id>      # Task detail\ncodex prompt \"...\"   # Create task\ncodex patch <id>     # Extract diff\ncodex yolo           # Auto-merge all\ncodex ui             # Launch this UI"
                            
                            background: Rectangle {
                                color: Qt.darker(colors.background, 1.2)
                                radius: 4
                            }
                        }
                    }
                }
            }
        }
    }
}

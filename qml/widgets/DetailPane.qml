import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    
    property int taskIndex: -1
    property string taskJson: ""
    property var taskData: taskJson ? JSON.parse(taskJson) : null
    property bool nerdMode: false
    property var themeColors: ({})
    
    signal archiveClicked()
    signal prClicked()
    signal patchClicked()
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 12
        
        // Header with actions
        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            
            Label {
                text: taskIndex >= 0 ? "Task #" + (taskIndex + 1) : "Select a task"
                font.bold: true
                font.pixelSize: 18
                color: themeColors.windowText || "#ffffff"
            }
            
            Item { Layout.fillWidth: true }
            
            Button {
                text: "📋 Patch"
                enabled: taskIndex >= 0
                onClicked: root.patchClicked()
                ToolTip.visible: hovered
                ToolTip.text: "Extract git patch (Ctrl+P)"
                
                background: Rectangle {
                    color: parent.hovered ? (themeColors.alternateBase || "#242424") : (themeColors.base || "#1a1a1a")
                    radius: 4
                    border.color: themeColors.border || "#333333"
                    border.width: 1
                }
                contentItem: Text {
                    text: parent.text
                    color: themeColors.windowText || "#ffffff"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            Button {
                text: "🔀 Create PR"
                enabled: taskIndex >= 0 && taskData && !taskData.pull_request
                onClicked: root.prClicked()
                ToolTip.visible: hovered
                ToolTip.text: "Create pull request"
                
                background: Rectangle {
                    color: parent.enabled ? (themeColors.accent || "#10a37f") : (themeColors.mid || "#333333")
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: "#ffffff"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            Button {
                text: "✓ Archive"
                enabled: taskIndex >= 0
                onClicked: root.archiveClicked()
                ToolTip.visible: hovered
                ToolTip.text: "Archive this task"
                
                background: Rectangle {
                    color: parent.hovered ? (themeColors.alternateBase || "#242424") : (themeColors.base || "#1a1a1a")
                    radius: 4
                    border.color: themeColors.border || "#333333"
                    border.width: 1
                }
                contentItem: Text {
                    text: parent.text
                    color: themeColors.windowText || "#ffffff"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
        
        // Task summary card
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: summaryColumn.implicitHeight + 24
            color: themeColors.alternateBase || "#242424"
            radius: 8
            border.color: themeColors.border || "#333333"
            border.width: 1
            visible: taskIndex >= 0 && taskData
            
            ColumnLayout {
                id: summaryColumn
                anchors.fill: parent
                anchors.margins: 12
                spacing: 8
                
                // Title
                Label {
                    Layout.fillWidth: true
                    text: taskData ? (taskData.title || "Untitled Task") : ""
                    font.bold: true
                    font.pixelSize: 16
                    wrapMode: Text.Wrap
                    color: themeColors.windowText || "#ffffff"
                }
                
                // Repository & Branch
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 16
                    
                    Label {
                        text: "📁 " + (taskData && taskData.repository ? taskData.repository.full_name : "")
                        opacity: 0.8
                        visible: taskData && taskData.repository
                        color: themeColors.windowText || "#ffffff"
                        
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (taskData && taskData.repository) {
                                    app.openUrl("https://github.com/" + taskData.repository.full_name)
                                }
                            }
                        }
                    }
                    
                    Label {
                        text: "🌿 " + (taskData ? (taskData.head_branch || taskData.branch || "") : "")
                        opacity: 0.8
                        visible: taskData && (taskData.head_branch || taskData.branch)
                        color: themeColors.windowText || "#ffffff"
                    }
                }
                
                // Status & PR
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 16
                    
                    // Status badge
                    Label {
                        text: taskData ? (taskData.status || "unknown") : ""
                        font.pixelSize: 12
                        padding: 4
                        leftPadding: 10
                        rightPadding: 10
                        background: Rectangle {
                            radius: 4
                            color: {
                                if (!taskData) return themeColors.mid || "#333333"
                                switch(taskData.status) {
                                    case "completed": return themeColors.success || "#22c55e"
                                    case "running": return themeColors.info || "#3b82f6"
                                    case "failed": return themeColors.error || "#ef4444"
                                    case "queued": return themeColors.warning || "#f59e0b"
                                    default: return themeColors.mid || "#333333"
                                }
                            }
                        }
                        color: "white"
                    }
                    
                    // PR link
                    Label {
                        text: "🔀 View Pull Request"
                        visible: taskData && taskData.pull_request
                        color: themeColors.accent || "#10a37f"
                        
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            hoverEnabled: true
                            onClicked: {
                                var pr = taskData.pull_request
                                var url = pr.html_url || pr.url || ""
                                if (url) app.openUrl(url)
                            }
                            onEntered: parent.font.underline = true
                            onExited: parent.font.underline = false
                        }
                    }
                    
                    Item { Layout.fillWidth: true }
                    
                    // Created date
                    Label {
                        text: taskData && taskData.created_at ? ("Created: " + taskData.created_at.substring(0, 10)) : ""
                        opacity: 0.6
                        font.pixelSize: 12
                        color: themeColors.textSecondary || themeColors.windowText || "#a0a0a0"
                    }
                }
            }
        }
        
        // Tabs for different views
        TabBar {
            id: tabBar
            Layout.fillWidth: true
            visible: taskIndex >= 0
            
            background: Rectangle {
                color: themeColors.base || "#1a1a1a"
                border.color: themeColors.border || "#333333"
                border.width: 1
                radius: 4
            }
            
            TabButton {
                text: "📝 Details"
                background: Rectangle {
                    color: tabBar.currentIndex === 0 ? (themeColors.alternateBase || "#242424") : "transparent"
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: tabBar.currentIndex === 0 ? (themeColors.accent || "#10a37f") : (themeColors.textSecondary || "#a0a0a0")
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 13
                }
            }
            TabButton {
                text: "💬 Prompt"
                background: Rectangle {
                    color: tabBar.currentIndex === 1 ? (themeColors.alternateBase || "#242424") : "transparent"
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: tabBar.currentIndex === 1 ? (themeColors.accent || "#10a37f") : (themeColors.textSecondary || "#a0a0a0")
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 13
                }
            }
            TabButton {
                text: "🔧 Raw JSON"
                background: Rectangle {
                    color: tabBar.currentIndex === 2 ? (themeColors.alternateBase || "#242424") : "transparent"
                    radius: 4
                }
                contentItem: Text {
                    text: parent.text
                    color: tabBar.currentIndex === 2 ? (themeColors.accent || "#10a37f") : (themeColors.textSecondary || "#a0a0a0")
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    font.pixelSize: 13
                }
            }
        }
        
        // Tab content
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: tabBar.currentIndex
            visible: taskIndex >= 0
            
            // Details tab
            ScrollView {
                clip: true
                
                ColumnLayout {
                    width: parent.width
                    spacing: 12
                    
                    // Turn info if available
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: turnsColumn.implicitHeight + 16
                        color: themeColors.base || "#1a1a1a"
                        radius: 4
                        border.color: themeColors.border || "#333333"
                        border.width: 1
                        visible: taskData && taskData.turns && taskData.turns.length > 0
                        
                        ColumnLayout {
                            id: turnsColumn
                            anchors.fill: parent
                            anchors.margins: 8
                            spacing: 4
                            
                            Label {
                                text: "Turns: " + (taskData && taskData.turns ? taskData.turns.length : 0)
                                font.bold: true
                            }
                            
                            Label {
                                text: taskData && taskData.current_turn_id ? ("Current: " + taskData.current_turn_id.substring(0, 8) + "...") : ""
                                opacity: 0.7
                                font.pixelSize: 12
                            }
                        }
                    }
                    
                    // Placeholder for more structured details
                    Label {
                        Layout.fillWidth: true
                        text: "Select 'Raw JSON' tab to see full task details"
                        opacity: 0.5
                        horizontalAlignment: Text.AlignHCenter
                        visible: !(taskData && taskData.turns && taskData.turns.length > 0)
                    }
                }
            }
            
            // Prompt tab
            ScrollView {
                clip: true
                
                TextArea {
                    text: {
                        if (!taskData) return ""
                        // Try to find the prompt in various locations
                        if (taskData.prompt) return taskData.prompt
                        if (taskData.input_items) {
                            for (var i = 0; i < taskData.input_items.length; i++) {
                                var item = taskData.input_items[i]
                                if (item.content) {
                                    for (var j = 0; j < item.content.length; j++) {
                                        if (item.content[j].text) {
                                            return item.content[j].text
                                        }
                                    }
                                }
                            }
                        }
                        return taskData.title || "No prompt found"
                    }
                    readOnly: true
                    font.pixelSize: 14
                    wrapMode: Text.Wrap
                    selectByMouse: true
                    color: themeColors.windowText || "#ffffff"
                    background: Rectangle {
                        color: themeColors.base || "#1a1a1a"
                        radius: 4
                        border.color: themeColors.border || "#333333"
                        border.width: 1
                    }
                }
            }
            
            // Raw JSON tab
            ScrollView {
                clip: true
                
                TextArea {
                    id: detailText
                    text: taskJson || "No task selected"
                    readOnly: true
                    font.family: "SF Mono, Monaco, Consolas, monospace"
                    font.pixelSize: 12
                    wrapMode: Text.Wrap
                    selectByMouse: true
                    background: Rectangle {
                        color: themeColors.codeBackground || "#1a1a1a"
                        radius: 4
                        border.color: themeColors.border || "#333333"
                        border.width: 1
                    }
                    color: themeColors.codeText || "#e0e0e0"
                }
            }
        }
        
        // Empty state
        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true
            visible: taskIndex < 0
            
            Label {
                anchors.centerIn: parent
                text: "← Select a task to view details"
                opacity: 0.5
                font.pixelSize: 16
                color: themeColors.windowText || "#ffffff"
            }
        }
    }
}

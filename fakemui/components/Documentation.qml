import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../contexts"
import "../fakemui"

/**
 * Documentation.qml - Tabbed documentation viewer
 * Mirrors React's Documentation.jsx
 */
Item {
    id: root
    
    property int currentTab: 0
    
    readonly property var tabs: [
        { key: "gettingStarted", title: LanguageContext.t("gettingStarted") },
        { key: "usingUI", title: LanguageContext.t("usingUI") },
        { key: "apiReference", title: LanguageContext.t("apiReference") },
        { key: "cliCommands", title: LanguageContext.t("cliCommands") },
        { key: "authentication", title: LanguageContext.t("authentication") }
    ]
    
    // Inline component for documentation content
    component DocContent: ScrollView {
        id: docScroll
        property var content: []
        clip: true
        
        ColumnLayout {
            width: docScroll.width - 32
            x: 16
            y: 16
            spacing: 12
            
            Repeater {
                model: content
                
                delegate: Loader {
                    Layout.fillWidth: true
                    sourceComponent: {
                        switch (modelData.type) {
                            case "h1": return h1Comp
                            case "h2": return h2Comp
                            case "p": return pComp
                            case "code": return codeComp
                            case "ul": return ulComp
                            default: return null
                        }
                    }
                    
                    property var itemData: modelData
                }
            }
            
            Item { Layout.preferredHeight: 32 }
        }
    }
    
    // H1 Component
    Component {
        id: h1Comp
        Text {
            text: itemData.text || ""
            font.pixelSize: 28
            font.bold: true
            color: Theme.text
            wrapMode: Text.WordWrap
        }
    }
    
    // H2 Component
    Component {
        id: h2Comp
        Column {
            spacing: 8
            Item { height: 8 }
            Text {
                text: itemData.text || ""
                font.pixelSize: 20
                font.bold: true
                color: Theme.text
                wrapMode: Text.WordWrap
            }
        }
    }
    
    // Paragraph Component
    Component {
        id: pComp
        Text {
            text: itemData.text || ""
            font.pixelSize: 14
            color: Theme.textSecondary
            wrapMode: Text.WordWrap
            lineHeight: 1.5
        }
    }
    
    // Code Block Component
    Component {
        id: codeComp
        Rectangle {
            width: parent.width
            height: codeText.height + 24
            color: Qt.rgba(0, 0, 0, 0.2)
            radius: 4
            
            Text {
                id: codeText
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 12
                text: itemData.text || ""
                font.pixelSize: 13
                font.family: "Courier New"
                color: Theme.text
                wrapMode: Text.WrapAnywhere
            }
        }
    }
    
    // Unordered List Component
    Component {
        id: ulComp
        Column {
            spacing: 8
            Repeater {
                model: itemData.items || []
                Row {
                    spacing: 8
                    Text {
                        text: "•"
                        font.pixelSize: 14
                        color: Theme.primary
                    }
                    Text {
                        text: modelData
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        wrapMode: Text.WordWrap
                    }
                }
            }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // Tab bar
        TabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            
            background: Rectangle {
                color: Theme.surface
                
                Rectangle {
                    anchors.bottom: parent.bottom
                    width: parent.width
                    height: 1
                    color: Theme.border
                }
            }
            
            Repeater {
                model: tabs
                
                TabButton {
                    text: modelData.title
                    width: implicitWidth + 32
                    
                    background: Rectangle {
                        color: tabBar.currentIndex === index ? 
                               Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12) : 
                               "transparent"
                    }
                    
                    contentItem: Text {
                        text: parent.text
                        font.pixelSize: 14
                        font.bold: tabBar.currentIndex === index
                        color: tabBar.currentIndex === index ? Theme.primary : Theme.textSecondary
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                }
            }
        }
        
        // Content area
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab
            
            // Getting Started
            DocContent {
                content: [
                    { type: "h1", text: LanguageContext.t("gettingStarted") },
                    { type: "p", text: LanguageContext.t("gettingStartedIntro") },
                    { type: "h2", text: LanguageContext.t("installation") },
                    { type: "code", text: "pip install codex-task-runner" },
                    { type: "h2", text: LanguageContext.t("quickStart") },
                    { type: "p", text: LanguageContext.t("quickStartDesc") },
                    { type: "code", text: "from codex_task_runner import CodexClient\n\nclient = CodexClient()\ntask = client.create_task(\"Fix the bug in main.py\")\nprint(task.id)" },
                    { type: "h2", text: LanguageContext.t("configuration") },
                    { type: "p", text: LanguageContext.t("configDesc") },
                    { type: "code", text: "# .env file\nCODEX_API_KEY=your_api_key\nCODEX_BASE_URL=https://api.codex.com" }
                ]
            }
            
            // Using UI
            DocContent {
                content: [
                    { type: "h1", text: LanguageContext.t("usingUI") },
                    { type: "p", text: LanguageContext.t("usingUIIntro") },
                    { type: "h2", text: LanguageContext.t("navigation") },
                    { type: "p", text: LanguageContext.t("navigationDesc") },
                    { type: "ul", items: [
                        LanguageContext.t("navTasks"),
                        LanguageContext.t("navNewPrompt"),
                        LanguageContext.t("navAccount"),
                        LanguageContext.t("navDocs")
                    ]},
                    { type: "h2", text: LanguageContext.t("taskList") },
                    { type: "p", text: LanguageContext.t("taskListDesc") },
                    { type: "h2", text: LanguageContext.t("taskDetail") },
                    { type: "p", text: LanguageContext.t("taskDetailDesc") },
                    { type: "h2", text: LanguageContext.t("keyboardShortcuts") },
                    { type: "code", text: "Ctrl+K / ⌘K  - Open search\nCtrl+N / ⌘N  - New task\nCtrl+R / ⌘R  - Refresh\nEsc          - Close dialogs" }
                ]
            }
            
            // API Reference
            DocContent {
                content: [
                    { type: "h1", text: LanguageContext.t("apiReference") },
                    { type: "p", text: LanguageContext.t("apiReferenceIntro") },
                    { type: "h2", text: "GET /tasks" },
                    { type: "p", text: LanguageContext.t("getTasksDesc") },
                    { type: "code", text: "curl -X GET 'http://localhost:5000/tasks?status=all&limit=20'" },
                    { type: "h2", text: "GET /task/:id" },
                    { type: "p", text: LanguageContext.t("getTaskDesc") },
                    { type: "code", text: "curl -X GET 'http://localhost:5000/task/abc123'" },
                    { type: "h2", text: "POST /prompt" },
                    { type: "p", text: LanguageContext.t("postPromptDesc") },
                    { type: "code", text: "curl -X POST 'http://localhost:5000/prompt' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"prompt_text\": \"Fix the bug\", \"branch\": \"main\"}'" },
                    { type: "h2", text: "POST /task/:id/pr" },
                    { type: "p", text: LanguageContext.t("createPRDesc") },
                    { type: "code", text: "curl -X POST 'http://localhost:5000/task/abc123/pr'" }
                ]
            }
            
            // CLI Commands
            DocContent {
                content: [
                    { type: "h1", text: LanguageContext.t("cliCommands") },
                    { type: "p", text: LanguageContext.t("cliCommandsIntro") },
                    { type: "h2", text: "codex tasks" },
                    { type: "p", text: LanguageContext.t("cliTasksDesc") },
                    { type: "code", text: "codex tasks --status=running --limit=10" },
                    { type: "h2", text: "codex run" },
                    { type: "p", text: LanguageContext.t("cliRunDesc") },
                    { type: "code", text: "codex run \"Implement the login feature\"" },
                    { type: "h2", text: "codex poll" },
                    { type: "p", text: LanguageContext.t("cliPollDesc") },
                    { type: "code", text: "codex poll abc123 --interval=5" },
                    { type: "h2", text: "codex pr" },
                    { type: "p", text: LanguageContext.t("cliPRDesc") },
                    { type: "code", text: "codex pr abc123 --title=\"Feature: Login\"" }
                ]
            }
            
            // Authentication
            DocContent {
                content: [
                    { type: "h1", text: LanguageContext.t("authentication") },
                    { type: "p", text: LanguageContext.t("authenticationIntro") },
                    { type: "h2", text: LanguageContext.t("apiKey") },
                    { type: "p", text: LanguageContext.t("apiKeyDesc") },
                    { type: "code", text: "export CODEX_API_KEY=your_api_key_here" },
                    { type: "h2", text: LanguageContext.t("sessionCookie") },
                    { type: "p", text: LanguageContext.t("sessionCookieDesc") },
                    { type: "code", text: "# Cookie is automatically managed by the browser\n# For CLI, export from browser developer tools" },
                    { type: "h2", text: LanguageContext.t("securityTips") },
                    { type: "ul", items: [
                        LanguageContext.t("securityTip1"),
                        LanguageContext.t("securityTip2"),
                        LanguageContext.t("securityTip3"),
                        LanguageContext.t("securityTip4")
                    ]}
                ]
            }
        }
    }
}

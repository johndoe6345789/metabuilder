import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "components"
import "contexts"
import "fakemui"

/**
 * App.qml - Main application component
 * Mirrors React's App.jsx with drawer navigation and view management
 */
ApplicationWindow {
    id: appWindow
    
    visible: true
    width: 1280
    height: 800
    minimumWidth: 800
    minimumHeight: 600
    title: "Codex Runner"
    color: Theme.background
    
    // Initialize Responsive singleton with this window
    Component.onCompleted: {
        Responsive.targetWindow = appWindow
        app.statusMessage.connect(onStatusMessage)
    }
    
    // Current view state
    property string currentView: "tasks"
    property int selectedTaskIndex: -1
    property bool searchOpen: false
    
    // Drawer width - responsive!
    readonly property int drawerWidth: Responsive.isMobile ? 0 : (Responsive.isTablet ? 200 : 240)
    
    function onStatusMessage(msg) {
        // Could show a snackbar/toast here
        console.log("Status:", msg)
    }
    
    // Keyboard shortcut: Cmd/Ctrl+K for search
    Shortcut {
        sequence: StandardKey.Find
        onActivated: searchOpen = true
    }
    
    Shortcut {
        sequence: "Ctrl+K"
        onActivated: searchOpen = true
    }
    
    // Navigation
    function navigateTo(view) {
        currentView = view
        selectedTaskIndex = -1
    }
    
    function selectTask(index) {
        selectedTaskIndex = index
        currentView = "taskDetail"
        // Load the task detail via Python controller
        app.loadTaskDetail(index)
    }
    
    // Layout: Drawer + Main Content
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        // Sidebar / Drawer
        Rectangle {
            id: drawer
            Layout.preferredWidth: drawerWidth
            Layout.fillHeight: true
            color: Theme.paper
            
            ColumnLayout {
                anchors.fill: parent
                spacing: 0
                
                // Header
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 64
                    color: "transparent"
                    
                    Text {
                        anchors.centerIn: parent
                        text: "Codex Runner"
                        font.pixelSize: 18
                        font.bold: true
                        color: Theme.primary
                    }
                }
                
                // Divider
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.12)
                }
                
                // Navigation Items
                ListView {
                    Layout.fillWidth: true
                    Layout.preferredHeight: contentHeight
                    interactive: false
                    
                    model: ListModel {
                        ListElement { viewId: "tasks"; emoji: "☰"; labelKey: "tasks" }
                        ListElement { viewId: "newPrompt"; emoji: "＋"; labelKey: "newTask" }
                    }
                    
                    delegate: ItemDelegate {
                        width: parent.width
                        height: 48
                        highlighted: currentView === viewId
                        
                        contentItem: RowLayout {
                            spacing: 16
                            
                            Text {
                                text: emoji
                                font.pixelSize: 20
                                color: Theme.text
                                Layout.leftMargin: 16
                            }
                            
                            Text {
                                text: LanguageContext.t(labelKey)
                                font.pixelSize: 14
                                color: Theme.text
                            }
                        }
                        
                        background: Rectangle {
                            color: highlighted ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12) 
                                              : (hovered ? Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.04) : "transparent")
                        }
                        
                        onClicked: navigateTo(viewId)
                    }
                }
                
                // Divider
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.12)
                }
                
                // Secondary Navigation
                ListView {
                    Layout.fillWidth: true
                    Layout.preferredHeight: contentHeight
                    interactive: false
                    
                    model: ListModel {
                        ListElement { viewId: "user"; emoji: "👤"; labelKey: "profile" }
                        ListElement { viewId: "docs"; emoji: "📖"; labelKey: "documentation" }
                    }
                    
                    delegate: ItemDelegate {
                        width: parent.width
                        height: 48
                        highlighted: currentView === viewId
                        
                        contentItem: RowLayout {
                            spacing: 16
                            
                            Text {
                                text: emoji
                                font.pixelSize: 20
                                color: Theme.text
                                Layout.leftMargin: 16
                            }
                            
                            Text {
                                text: LanguageContext.t(labelKey)
                                font.pixelSize: 14
                                color: Theme.text
                            }
                        }
                        
                        background: Rectangle {
                            color: highlighted ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12) 
                                              : (hovered ? Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.04) : "transparent")
                        }
                        
                        onClicked: navigateTo(viewId)
                    }
                }
                
                // Divider
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.12)
                }
                
                // Settings Section
                Item {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 48
                    
                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 16
                        anchors.rightMargin: 16
                        
                        Text {
                            text: "💻"
                            font.pixelSize: 16
                        }
                        
                        Text {
                            text: LanguageContext.t("nerdMode")
                            font.pixelSize: 14
                            color: Theme.text
                            Layout.fillWidth: true
                        }
                        
                        Switch {
                            checked: NerdModeContext.nerdMode
                            onToggled: NerdModeContext.setNerdMode(checked)
                        }
                    }
                }
                
                // Theme selector
                ItemDelegate {
                    Layout.fillWidth: true
                    height: 48
                    
                    contentItem: RowLayout {
                        spacing: 16
                        
                        Text {
                            text: "🎨"
                            font.pixelSize: 16
                            Layout.leftMargin: 16
                        }
                        
                        Text {
                            text: LanguageContext.t("theme") + ": " + Theme.current.name
                            font.pixelSize: 14
                            color: Theme.text
                        }
                    }
                    
                    onClicked: themeMenu.open()
                    
                    Menu {
                        id: themeMenu
                        
                        Repeater {
                            model: Theme.themeKeys
                            
                            MenuItem {
                                text: Theme.themes[modelData].name
                                checkable: true
                                checked: Theme.themeName === modelData
                                onTriggered: Theme.setTheme(modelData)
                                
                                indicator: Rectangle {
                                    implicitWidth: 12
                                    implicitHeight: 12
                                    x: 6
                                    y: parent.height / 2 - 6
                                    radius: 6
                                    color: Theme.themes[modelData].primary
                                }
                            }
                        }
                    }
                }
                
                // Language selector
                ItemDelegate {
                    Layout.fillWidth: true
                    height: 48
                    
                    contentItem: RowLayout {
                        spacing: 16
                        
                        Text {
                            text: "🌐"
                            font.pixelSize: 16
                            Layout.leftMargin: 16
                        }
                        
                        Text {
                            text: LanguageContext.t("language") + ": " + LanguageContext.languages[LanguageContext.language].flag
                            font.pixelSize: 14
                            color: Theme.text
                        }
                    }
                    
                    onClicked: languageMenu.open()
                    
                    Menu {
                        id: languageMenu
                        
                        Repeater {
                            model: LanguageContext.languageKeys
                            
                            MenuItem {
                                text: LanguageContext.languages[modelData].flag + " " + LanguageContext.languages[modelData].name
                                checkable: true
                                checked: LanguageContext.language === modelData
                                onTriggered: LanguageContext.setLanguage(modelData)
                            }
                        }
                    }
                }
                
                // Spacer
                Item { Layout.fillHeight: true }
                
                // User chip at bottom - shows connection status
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 48
                    Layout.margins: 16
                    color: Qt.rgba(Theme.text.r, Theme.text.g, Theme.text.b, 0.08)
                    radius: 24
                    
                    RowLayout {
                        anchors.centerIn: parent
                        spacing: 8
                        
                        Text {
                            text: "🔌"
                            font.pixelSize: 16
                        }
                        
                        Text {
                            text: "Python API"
                            font.pixelSize: 12
                            color: Theme.text
                        }
                    }
                }
            }
        }
        
        // Main Content Area
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: Theme.background
            
            ColumnLayout {
                anchors.fill: parent
                spacing: 0
                
                // App Bar
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 64
                    color: Theme.paper
                    
                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 16
                        anchors.rightMargin: 16
                        
                        Text {
                            text: {
                                switch(currentView) {
                                    case "tasks": return LanguageContext.t("tasks")
                                    case "taskDetail": return LanguageContext.t("taskDetail")
                                    case "newPrompt": return LanguageContext.t("newTask")
                                    case "user": return LanguageContext.t("profile")
                                    case "docs": return LanguageContext.t("documentation")
                                    default: return ""
                                }
                            }
                            font.pixelSize: 20
                            font.bold: true
                            color: Theme.text
                        }
                        
                        Item { Layout.fillWidth: true }
                        
                        // Search button
                        CIconButton {
                            icon: "🔍"
                            tooltip: LanguageContext.t("search") + " (⌘K)"
                            onClicked: searchOpen = true
                        }
                        
                        // Docs button
                        CIconButton {
                            icon: "📖"
                            tooltip: LanguageContext.t("documentation")
                            onClicked: navigateTo("docs")
                        }
                        
                        // Refresh button
                        CIconButton {
                            icon: "🔄"
                            tooltip: "Refresh"
                            onClicked: app.loadTasks()
                        }
                    }
                }
                
                // Content
                StackLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    currentIndex: {
                        switch(currentView) {
                            case "tasks": return 0
                            case "taskDetail": return 1
                            case "newPrompt": return 2
                            case "user": return 3
                            case "docs": return 4
                            default: return 0
                        }
                    }
                    
                    // Tasks View
                    TaskList {
                        onTaskSelected: function(index) { selectTask(index) }
                    }
                    
                    // Task Detail View
                    TaskDetail {
                        taskIndex: selectedTaskIndex
                        onBack: navigateTo("tasks")
                    }
                    
                    // New Prompt View
                    NewPrompt {
                        onSuccess: navigateTo("tasks")
                    }
                    
                    // User Info View
                    UserInfo {}
                    
                    // Documentation View
                    Documentation {}
                }
            }
        }
    }
    
    // Search Dialog
    SearchDialog {
        id: searchDialog
        visible: searchOpen
        onRejected: searchOpen = false
        onTaskSelected: function(index) {
            searchOpen = false
            selectTask(index)
        }
    }
    
    // Ajax Queue Widget (fixed position, bottom right)
    AjaxQueueWidget {
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.margins: 16
    }
}

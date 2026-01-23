import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../contexts"
import "../fakemui"

/**
 * UserInfo.qml - User profile and connection status
 * Uses Python AppController (app) - shows session info
 */
Item {
    id: root
    
    // State
    property var sessionInfo: null
    property string debugLogs: ""
    property string connectionStatus: "unknown"
    
    Component.onCompleted: {
        app.sessionInfoChanged.connect(onSessionInfo)
        app.debugLog.connect(onDebugLog)
        // Request session info if in nerd mode
        if (NerdModeContext.nerdMode) {
            app.setNerdMode(true)  // This emits sessionInfoChanged
        }
        // Check connection by loading tasks
        connectionStatus = "checking"
        app.tasksLoaded.connect(onConnected)
        app.errorOccurred.connect(onConnectionError)
    }
    
    Component.onDestruction: {
        app.sessionInfoChanged.disconnect(onSessionInfo)
        app.debugLog.disconnect(onDebugLog)
        app.tasksLoaded.disconnect(onConnected)
        app.errorOccurred.disconnect(onConnectionError)
    }
    
    function onSessionInfo(jsonStr) {
        try {
            sessionInfo = JSON.parse(jsonStr)
        } catch (e) {
            sessionInfo = null
        }
    }
    
    function onDebugLog(entry) {
        debugLogs = app.getDebugLogs()
    }
    
    function onConnected() {
        connectionStatus = "connected"
    }
    
    function onConnectionError(msg) {
        if (msg.includes("session") || msg.includes("auth")) {
            connectionStatus = "disconnected"
        }
    }
    
    function openCodex() {
        app.openCodexBrowser()
    }
    
    ScrollView {
        anchors.fill: parent
        anchors.margins: 16
        clip: true
        
        ColumnLayout {
            width: parent.width
            spacing: 16
            
            // Connection status card
            CCard {
                Layout.fillWidth: true
                Layout.maximumWidth: 600
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredHeight: contentCol1.implicitHeight + 48
                
                ColumnLayout {
                    id: contentCol1
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 24
                    spacing: 16
                    
                    Text {
                        text: LanguageContext.t("connectionStatus")
                        font.pixelSize: 18
                        font.bold: true
                        color: Theme.text
                    }
                    
                    RowLayout {
                        spacing: 12
                        
                        // Status indicator
                        Rectangle {
                            width: 12
                            height: 12
                            radius: 6
                            color: connectionStatus === "connected" ? Theme.success :
                                   connectionStatus === "disconnected" ? Theme.error : Theme.warning
                        }
                        
                        Text {
                            text: connectionStatus === "connected" ? LanguageContext.t("connected") :
                                  connectionStatus === "disconnected" ? LanguageContext.t("disconnected") :
                                  connectionStatus === "checking" ? "Checking..." :
                                  LanguageContext.t("unknown")
                            font.pixelSize: 16
                            color: Theme.text
                        }
                    }
                    
                    Text {
                        text: connectionStatus === "connected" ? 
                              LanguageContext.t("connectedDesc") :
                              connectionStatus === "disconnected" ?
                              "Set up your .env file with CODEX_SESSION_TOKEN" :
                              "Checking connection..."
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        wrapMode: Text.WordWrap
                        Layout.fillWidth: true
                    }
                    
                    // Actions
                    RowLayout {
                        spacing: 12
                        
                        CButton {
                            text: "Open Codex in Browser"
                            variant: "outlined"
                            onClicked: openCodex()
                        }
                        
                        CButton {
                            text: LanguageContext.t("refresh")
                            variant: "text"
                            onClicked: {
                                connectionStatus = "checking"
                                app.loadTasks()
                            }
                        }
                    }
                }
            }
            
            // Session Info card (nerd mode only)
            CCard {
                Layout.fillWidth: true
                Layout.maximumWidth: 600
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredHeight: contentCol2.implicitHeight + 48
                visible: NerdModeContext.nerdMode
                
                ColumnLayout {
                    id: contentCol2
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 24
                    spacing: 16
                    
                    Text {
                        text: "Session Info"
                        font.pixelSize: 18
                        font.bold: true
                        color: Theme.text
                    }
                    
                    GridLayout {
                        Layout.fillWidth: true
                        columns: 2
                        columnSpacing: 16
                        rowSpacing: 12
                        
                        Text {
                            text: "Has Session"
                            font.pixelSize: 14
                            font.bold: true
                            color: Theme.textSecondary
                        }
                        
                        Text {
                            text: sessionInfo?.has_session ? "Yes" : "No"
                            font.pixelSize: 14
                            color: sessionInfo?.has_session ? Theme.success : Theme.error
                        }
                        
                        Text {
                            text: "Base URL"
                            font.pixelSize: 14
                            font.bold: true
                            color: Theme.textSecondary
                        }
                        
                        Text {
                            text: sessionInfo?.base_url || "—"
                            font.pixelSize: 14
                            color: Theme.text
                            font.family: "monospace"
                        }
                        
                        Text {
                            text: "Cookie Preview"
                            font.pixelSize: 14
                            font.bold: true
                            color: Theme.textSecondary
                        }
                        
                        Text {
                            text: sessionInfo?.cookie_preview || "—"
                            font.pixelSize: 14
                            color: Theme.text
                            font.family: "monospace"
                            elide: Text.ElideMiddle
                            Layout.maximumWidth: 200
                        }
                    }
                }
            }
            
            // Debug Logs card (nerd mode only)
            CCard {
                Layout.fillWidth: true
                Layout.maximumWidth: 600
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredHeight: contentCol3.implicitHeight + 48
                visible: NerdModeContext.nerdMode
                
                ColumnLayout {
                    id: contentCol3
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 24
                    spacing: 16
                    
                    RowLayout {
                        Layout.fillWidth: true
                        
                        Text {
                            text: "Debug Logs"
                            font.pixelSize: 18
                            font.bold: true
                            color: Theme.text
                        }
                        
                        Item { Layout.fillWidth: true }
                        
                        CButton {
                            text: "Clear"
                            variant: "text"
                            size: "small"
                            onClicked: {
                                app.clearDebugLogs()
                                debugLogs = ""
                            }
                        }
                    }
                    
                    ScrollView {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 200
                        clip: true
                        
                        TextArea {
                            text: debugLogs || "(no logs yet)"
                            font.family: "monospace"
                            font.pixelSize: 11
                            color: Theme.text
                            readOnly: true
                            wrapMode: Text.NoWrap
                            
                            background: Rectangle {
                                color: Theme.surface
                                radius: 4
                            }
                        }
                    }
                }
            }
            
            // Setup instructions
            CCard {
                Layout.fillWidth: true
                Layout.maximumWidth: 600
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredHeight: contentCol4.implicitHeight + 48
                visible: connectionStatus === "disconnected"
                
                ColumnLayout {
                    id: contentCol4
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 24
                    spacing: 16
                    
                    Text {
                        text: "Setup Instructions"
                        font.pixelSize: 18
                        font.bold: true
                        color: Theme.text
                    }
                    
                    Text {
                        text: "1. Open ChatGPT/Codex in your browser"
                        font.pixelSize: 14
                        color: Theme.textSecondary
                    }
                    
                    Text {
                        text: "2. Open DevTools → Application → Cookies"
                        font.pixelSize: 14
                        color: Theme.textSecondary
                    }
                    
                    Text {
                        text: "3. Copy the __Secure-next-auth.session-token value"
                        font.pixelSize: 14
                        color: Theme.textSecondary
                    }
                    
                    Text {
                        text: "4. Create a .env file with CODEX_SESSION_TOKEN=<token>"
                        font.pixelSize: 14
                        color: Theme.textSecondary
                    }
                    
                    Text {
                        text: "5. Restart the app"
                        font.pixelSize: 14
                        color: Theme.textSecondary
                    }
                }
            }
        }
    }
}

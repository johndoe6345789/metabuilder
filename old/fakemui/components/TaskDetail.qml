import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../contexts"
import "../fakemui"

/**
 * TaskDetail.qml - Task detail view with tabs
 * Uses Python AppController (app) directly instead of HTTP/XHR
 */
Item {
    id: root
    
    property int taskIndex: -1
    signal back()
    
    // State
    property var detail: null
    property bool loading: true
    property string error: ""
    property int tabIndex: 0
    property string snackbarMessage: ""
    
    onTaskIndexChanged: {
        if (taskIndex >= 0) {
            loading = true
            // Controller will load detail and emit signal
        }
    }
    
    Component.onCompleted: {
        app.taskDetailLoaded.connect(onTaskDetailLoaded)
        app.patchReady.connect(onPatchReady)
        app.errorOccurred.connect(onError)
    }
    
    Component.onDestruction: {
        app.taskDetailLoaded.disconnect(onTaskDetailLoaded)
        app.patchReady.disconnect(onPatchReady)
        app.errorOccurred.disconnect(onError)
    }
    
    function onTaskDetailLoaded(jsonStr) {
        try {
            detail = JSON.parse(jsonStr)
        } catch (e) {
            detail = null
        }
        loading = false
    }
    
    function onPatchReady(diff) {
        detail = detail || {}
        detail.patch = { diff: diff }
        tabIndex = 2
    }
    
    function onError(msg) {
        error = msg
        loading = false
    }
    
    function createPR() {
        app.createPR(taskIndex)
    }
    
    function extractPatch() {
        app.extractPatch(taskIndex)
    }
    
    function copyToClipboard(text) {
        app.copyToClipboard(text)
        showSnackbar(LanguageContext.t("copied"))
    }
    
    function showSnackbar(message) {
        snackbarMessage = message
        snackbarTimer.restart()
    }
    
    Timer {
        id: snackbarTimer
        interval: 3000
        onTriggered: snackbarMessage = ""
    }
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 16
        
        // Back button
        CButton {
            iconText: "←"
            text: LanguageContext.t("backToTasks")
            variant: "text"
            onClicked: back()
        }
        
        // Error alert
        Rectangle {
            Layout.fillWidth: true
            visible: error !== ""
            height: 48
            color: Qt.rgba(Theme.error.r, Theme.error.g, Theme.error.b, 0.12)
            radius: 4
            
            Text {
                anchors.centerIn: parent
                text: error
                color: Theme.error
            }
        }
        
        // Task card header
        CCard {
            Layout.fillWidth: true
            Layout.preferredHeight: headerContent.implicitHeight + 32
            
            ColumnLayout {
                id: headerContent
                Layout.fillWidth: true
                Layout.fillHeight: true
                Layout.margins: 16
                spacing: 12
                
                Text {
                    text: detail?.title || LanguageContext.t("taskDetail")
                    font.pixelSize: 20
                    font.bold: true
                    color: Theme.text
                }
                
                RowLayout {
                    spacing: 8
                    
                    CChip {
                        text: detail?.repository?.full_name || detail?.repo || LanguageContext.t("noRepo")
                    }
                    
                    CChip {
                        text: detail?.head_branch || detail?.base_branch || "main"
                        variant: "outlined"
                    }
                    
                    CChip {
                        text: detail?.status || "pending"
                        color: detail?.status === "completed" ? Theme.success : Theme.textMuted
                    }
                }
                
                Text {
                    visible: NerdModeContext.nerdMode && detail
                    text: "ID: " + (detail?.id || detail?.task_id || "")
                    font.pixelSize: 12
                    font.family: "monospace"
                    color: Theme.textMuted
                }
                
                // Action buttons
                RowLayout {
                    spacing: 8
                    
                    CButton {
                        text: LanguageContext.t("createPR")
                        iconText: "🔗"
                        variant: "contained"
                        onClicked: createPR()
                    }
                    
                    CButton {
                        text: LanguageContext.t("getPatch")
                        iconText: "📝"
                        variant: "outlined"
                        onClicked: extractPatch()
                    }
                }
            }
        }
        
        // Tabs
        TabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: tabIndex
            onCurrentIndexChanged: tabIndex = currentIndex
            
            background: Rectangle {
                color: Theme.surface
            }
            
            TabButton {
                text: LanguageContext.t("details")
                width: implicitWidth
            }
            
            TabButton {
                text: LanguageContext.t("patch")
                width: implicitWidth
            }
        }
        
        // Tab content
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: tabIndex
            
            // Details tab
            ScrollView {
                clip: true
                
                CCard {
                    width: parent.width
                    implicitHeight: detailContent.implicitHeight + 32
                    
                    ColumnLayout {
                        id: detailContent
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        Layout.margins: 16
                        spacing: 12
                        
                        // Nerd mode: raw JSON
                        TextArea {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            visible: NerdModeContext.nerdMode && detail
                            text: detail ? JSON.stringify(detail, null, 2) : ""
                            font.family: "monospace"
                            font.pixelSize: 12
                            color: Theme.text
                            readOnly: true
                            wrapMode: Text.Wrap
                            
                            background: Rectangle {
                                color: Theme.surface
                                radius: 4
                            }
                        }
                        
                        // Normal mode: formatted
                        ColumnLayout {
                            visible: !NerdModeContext.nerdMode
                            Layout.fillWidth: true
                            spacing: 12
                            
                            Text {
                                text: detail?.title || ""
                                font.pixelSize: 18
                                font.bold: true
                                color: Theme.text
                                wrapMode: Text.WordWrap
                                Layout.fillWidth: true
                            }
                            
                            MarkdownRenderer {
                                Layout.fillWidth: true
                                text: detail?.description || detail?.prompt || ""
                            }
                        }
                    }
                }
            }
            
            // Patch tab
            CCard {
                ColumnLayout {
                    id: patchContent
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 16
                    spacing: 12
                    
                    // Patch loaded
                    ColumnLayout {
                        visible: detail?.patch !== undefined
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 12
                        
                        // Header
                        RowLayout {
                            Layout.fillWidth: true
                            
                            Text {
                                text: "Git Patch"
                                font.pixelSize: 14
                                font.bold: true
                                color: Theme.text
                            }
                            
                            Item { Layout.fillWidth: true }
                            
                            CIconButton {
                                icon: "📋"
                                tooltip: "Copy"
                                onClicked: copyToClipboard(detail?.patch?.diff || "")
                            }
                        }
                        
                        // Diff view
                        ScrollView {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            clip: true
                            
                            TextArea {
                                width: parent.width
                                text: detail?.patch?.diff || LanguageContext.t("noPatch")
                                font.family: "monospace"
                                font.pixelSize: 12
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
                    
                    // Load patch button
                    CButton {
                        visible: detail?.patch === undefined
                        text: LanguageContext.t("loadPatch")
                        variant: "contained"
                        onClicked: extractPatch()
                        Layout.alignment: Qt.AlignHCenter
                    }
                }
            }
        }
        
        // Snackbar
        Rectangle {
            Layout.alignment: Qt.AlignHCenter
            visible: snackbarMessage !== ""
            width: snackbarText.width + 32
            height: 48
            color: Theme.paper
            radius: 4
            
            layer.enabled: true
            layer.effect: Item {
                // Shadow effect placeholder
            }
            
            Text {
                id: snackbarText
                anchors.centerIn: parent
                text: snackbarMessage
                color: Theme.text
                font.pixelSize: 14
            }
        }
    }
    
    // Loading overlay
    Item {
        anchors.fill: parent
        visible: loading
        
        Rectangle {
            anchors.fill: parent
            color: Qt.rgba(0, 0, 0, 0.3)
        }
        
        BusyIndicator {
            anchors.centerIn: parent
            running: loading
        }
    }
}

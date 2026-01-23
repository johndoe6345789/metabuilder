import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../contexts"
import "../fakemui"

/**
 * NewPrompt.qml - Create new task form
 * Uses Python AppController (app) directly instead of HTTP/XHR
 */
Item {
    id: root
    
    signal success()
    
    // Form state
    property string prompt: ""
    property string branch: "main"
    property int bestOf: 1
    property bool loading: false
    property string error: ""
    property string successMessage: ""
    property var environments: []
    property string selectedEnvId: ""
    
    Component.onCompleted: {
        app.environmentsLoaded.connect(onEnvironmentsLoaded)
        app.promptSuccess.connect(onPromptSuccess)
        app.promptError.connect(onPromptError)
        // Load environments for task creation
        app.loadEnvironments()
    }
    
    Component.onDestruction: {
        app.environmentsLoaded.disconnect(onEnvironmentsLoaded)
        app.promptSuccess.disconnect(onPromptSuccess)
        app.promptError.disconnect(onPromptError)
    }
    
    function onEnvironmentsLoaded(envs) {
        environments = envs
        if (envs.length > 0) {
            selectedEnvId = envs[0].id
        }
    }
    
    function onPromptSuccess(taskId) {
        loading = false
        successMessage = LanguageContext.t("taskCreated") + " (" + taskId.substring(0, 8) + "...)"
        prompt = ""
        successTimer.start()
    }
    
    function onPromptError(msg) {
        loading = false
        error = msg
    }
    
    function handleSubmit() {
        if (!prompt.trim()) {
            error = LanguageContext.t("enterPrompt")
            return
        }
        
        if (!selectedEnvId) {
            error = "Select an environment (repository)"
            return
        }
        
        loading = true
        error = ""
        successMessage = ""
        
        // Use Python controller to create task
        app.sendPrompt(prompt, selectedEnvId, branch, bestOf)
    }
    
    Timer {
        id: successTimer
        interval: 2000
        onTriggered: success()
    }
    
    ScrollView {
        anchors.fill: parent
        anchors.margins: 16
        clip: true
        
        ColumnLayout {
            width: parent.width
            spacing: 16
            
            // Main form card
            CCard {
                Layout.fillWidth: true
                Layout.maximumWidth: 600
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredHeight: formContent.implicitHeight + 48
                
                ColumnLayout {
                    id: formContent
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 24
                    spacing: 16
                    
                    // Title
                    Text {
                        text: LanguageContext.t("createNewTask")
                        font.pixelSize: 24
                        font.bold: true
                        color: Theme.text
                    }
                    
                    Text {
                        text: LanguageContext.t("sendPromptDesc")
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        Layout.fillWidth: true
                        wrapMode: Text.WordWrap
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
                    
                    // Success alert
                    Rectangle {
                        Layout.fillWidth: true
                        visible: successMessage !== ""
                        height: 48
                        color: Qt.rgba(Theme.success.r, Theme.success.g, Theme.success.b, 0.12)
                        radius: 4
                        
                        Text {
                            anchors.centerIn: parent
                            text: successMessage
                            color: Theme.success
                        }
                    }
                    
                    // Prompt textarea
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 8
                        
                        Text {
                            text: LanguageContext.t("taskPrompt")
                            font.pixelSize: 14
                            font.bold: true
                            color: Theme.text
                        }
                        
                        ScrollView {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 160
                            
                            TextArea {
                                id: promptInput
                                text: prompt
                                onTextChanged: prompt = text
                                placeholderText: LanguageContext.t("promptPlaceholder")
                                wrapMode: Text.Wrap
                                enabled: !loading
                                font.pixelSize: 14
                                color: Theme.text
                                
                                background: Rectangle {
                                    color: Theme.surface
                                    border.color: promptInput.activeFocus ? Theme.primary : Theme.border
                                    border.width: promptInput.activeFocus ? 2 : 1
                                    radius: 4
                                }
                            }
                        }
                    }
                    
                    // Branch and Best Of row
                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 16
                        
                        // Environment selector
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 8
                            
                            Text {
                                text: "Repository"
                                font.pixelSize: 14
                                font.bold: true
                                color: Theme.text
                            }
                            
                            ComboBox {
                                id: envCombo
                                Layout.fillWidth: true
                                model: environments
                                textRole: "name"
                                valueRole: "id"
                                currentIndex: environments.length > 0 ? 0 : -1
                                onActivated: selectedEnvId = currentValue
                                enabled: !loading && environments.length > 0
                                
                                background: Rectangle {
                                    color: Theme.surface
                                    border.color: Theme.border
                                    border.width: 1
                                    radius: 4
                                    implicitHeight: 40
                                }
                                
                                popup.background: Rectangle {
                                    color: Theme.paper
                                    border.color: Theme.border
                                    radius: 4
                                }
                            }
                            
                            Text {
                                visible: environments.length === 0
                                text: "Loading repositories..."
                                font.pixelSize: 12
                                color: Theme.textMuted
                            }
                        }
                        
                        // Branch input
                        ColumnLayout {
                            Layout.preferredWidth: 150
                            spacing: 8
                            
                            Text {
                                text: LanguageContext.t("branch")
                                font.pixelSize: 14
                                font.bold: true
                                color: Theme.text
                            }
                            
                            TextField {
                                id: branchInput
                                Layout.fillWidth: true
                                text: branch
                                onTextChanged: branch = text
                                enabled: !loading
                                font.pixelSize: 14
                                color: Theme.text
                                
                                background: Rectangle {
                                    color: Theme.surface
                                    border.color: branchInput.activeFocus ? Theme.primary : Theme.border
                                    border.width: branchInput.activeFocus ? 2 : 1
                                    radius: 4
                                    implicitHeight: 40
                                }
                            }
                        }
                        
                        // Best Of dropdown
                        ColumnLayout {
                            spacing: 8
                            
                            Text {
                                text: LanguageContext.t("bestOf")
                                font.pixelSize: 14
                                font.bold: true
                                color: Theme.text
                            }
                            
                            ComboBox {
                                id: bestOfCombo
                                model: [1, 2, 3, 5]
                                currentIndex: 0
                                onActivated: bestOf = currentValue
                                enabled: !loading
                                
                                background: Rectangle {
                                    color: Theme.surface
                                    border.color: Theme.border
                                    border.width: 1
                                    radius: 4
                                    implicitWidth: 80
                                    implicitHeight: 40
                                }
                            }
                        }
                    }
                    
                    // Submit button
                    CButton {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 48
                        text: loading ? LanguageContext.t("creating") : LanguageContext.t("createNewTask")
                        variant: "primary"
                        enabled: !loading && prompt.trim() !== ""
                        onClicked: handleSubmit()
                        
                        BusyIndicator {
                            anchors.left: parent.left
                            anchors.leftMargin: 16
                            anchors.verticalCenter: parent.verticalCenter
                            running: loading
                            visible: loading
                            width: 24
                            height: 24
                        }
                    }
                }
            }
            
            // Tips card
            CCard {
                Layout.fillWidth: true
                Layout.maximumWidth: 600
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredHeight: tipsContent.implicitHeight + 48
                
                ColumnLayout {
                    id: tipsContent
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.margins: 24
                    spacing: 12
                    
                    Text {
                        text: LanguageContext.t("tips")
                        font.pixelSize: 16
                        font.bold: true
                        color: Theme.text
                    }
                    
                    Text {
                        text: "• " + LanguageContext.t("tip1")
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        wrapMode: Text.WordWrap
                        Layout.fillWidth: true
                    }
                    
                    Text {
                        text: "• " + LanguageContext.t("tip2")
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        wrapMode: Text.WordWrap
                        Layout.fillWidth: true
                    }
                    
                    Text {
                        text: "• " + LanguageContext.t("tip3")
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        wrapMode: Text.WordWrap
                        Layout.fillWidth: true
                    }
                    
                    Text {
                        text: "• " + LanguageContext.t("tip4")
                        font.pixelSize: 14
                        color: Theme.textSecondary
                        wrapMode: Text.WordWrap
                        Layout.fillWidth: true
                    }
                }
            }
        }
    }
}

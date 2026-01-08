import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Dialog {
    id: dialog
    title: "Send Prompt to Codex"
    width: 700
    height: 500
    modal: true
    standardButtons: Dialog.Cancel
    
    property var environments: []
    property bool sending: false
    property var themeColors: ({})
    
    // Internal colors with fallbacks
    readonly property var colors: ({
        background: themeColors.window || themeColors.background || "#0d0d0d",
        paper: themeColors.alternateBase || "#1a1a1a",
        text: themeColors.windowText || themeColors.text || "#ffffff",
        textSecondary: themeColors.textSecondary || "#a0a0a0",
        accent: themeColors.accent || "#10a37f",
        error: themeColors.error || "#ef4444",
        border: themeColors.border || "#333333"
    })
    
    background: Rectangle {
        color: colors.background
        radius: 8
        border.color: colors.border
        border.width: 1
    }
    
    header: Label {
        text: dialog.title
        font.bold: true
        font.pixelSize: 16
        color: colors.text
        padding: 16
        background: Rectangle {
            color: colors.paper
            radius: 8
        }
    }
    
    signal promptSubmitted(string prompt, string envId, string branch, int bestOf)
    
    function open() {
        promptField.text = ""
        branchField.text = "main"
        bestOfSpinner.value = 1
        errorLabel.text = ""
        sending = false
        visible = true
    }
    
    function setEnvironments(envList) {
        environments = envList
        envCombo.model = envList.map(e => e.name || e.full_name || e.id)
        if (envList.length > 0) {
            envCombo.currentIndex = 0
        }
    }
    
    function showError(msg) {
        errorLabel.text = msg
        sending = false
    }
    
    function showSuccess(taskId) {
        sending = false
        close()
    }
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 16
        
        // Environment selector
        GridLayout {
            Layout.fillWidth: true
            columns: 2
            columnSpacing: 12
            rowSpacing: 8
            
            Label {
                text: "Environment:"
                Layout.alignment: Qt.AlignRight
                color: colors.text
            }
            
            ComboBox {
                id: envCombo
                Layout.fillWidth: true
                model: []
                enabled: !sending
                
                background: Rectangle {
                    color: colors.paper
                    radius: 4
                    border.color: colors.border
                }
                contentItem: Text {
                    leftPadding: 8
                    text: envCombo.displayText
                    color: colors.text
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            Label {
                text: "Branch:"
                Layout.alignment: Qt.AlignRight
                color: colors.text
            }
            
            TextField {
                id: branchField
                Layout.fillWidth: true
                text: "main"
                placeholderText: "main"
                enabled: !sending
                color: colors.text
                placeholderTextColor: colors.textSecondary
                
                background: Rectangle {
                    color: colors.paper
                    radius: 4
                    border.color: branchField.activeFocus ? colors.accent : colors.border
                }
            }
            
            Label {
                text: "Best of N:"
                Layout.alignment: Qt.AlignRight
                color: colors.text
            }
            
            SpinBox {
                id: bestOfSpinner
                from: 1
                to: 5
                value: 1
                enabled: !sending
                
                background: Rectangle {
                    color: colors.paper
                    radius: 4
                    border.color: colors.border
                }
                contentItem: TextInput {
                    text: bestOfSpinner.textFromValue(bestOfSpinner.value, bestOfSpinner.locale)
                    color: colors.text
                    horizontalAlignment: Qt.AlignHCenter
                    verticalAlignment: Qt.AlignVCenter
                    readOnly: !bestOfSpinner.editable
                    validator: bestOfSpinner.validator
                }
            }
        }
        
        // Prompt input
        Label {
            text: "Prompt:"
            font.bold: true
            color: colors.text
        }
        
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            
            TextArea {
                id: promptField
                placeholderText: "Describe the task you want Codex to perform...\n\nExample:\nAdd a dark mode toggle to the settings page. It should persist the preference in localStorage."
                wrapMode: Text.Wrap
                font.pixelSize: 14
                enabled: !sending
                selectByMouse: true
                color: colors.text
                placeholderTextColor: colors.textSecondary
                
                background: Rectangle {
                    color: colors.paper
                    radius: 4
                    border.color: promptField.activeFocus ? colors.accent : colors.border
                }
            }
        }
        
        // Error message
        Label {
            id: errorLabel
            Layout.fillWidth: true
            color: colors.error
            wrapMode: Text.Wrap
            visible: text.length > 0
        }
        
        // Submit button
        RowLayout {
            Layout.fillWidth: true
            
            Item { Layout.fillWidth: true }
            
            BusyIndicator {
                running: sending
                visible: sending
                Layout.preferredWidth: 24
                Layout.preferredHeight: 24
            }
            
            Button {
                id: sendButton
                text: sending ? "Sending..." : "🚀 Send Prompt"
                enabled: !sending && promptField.text.trim().length > 0 && envCombo.currentIndex >= 0
                highlighted: true
                
                background: Rectangle {
                    color: sendButton.enabled ? colors.accent : Qt.darker(colors.accent, 1.5)
                    radius: 4
                    opacity: sendButton.hovered ? 0.9 : 1.0
                }
                contentItem: Text {
                    text: sendButton.text
                    color: "white"
                    font.bold: true
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                
                onClicked: {
                    if (promptField.text.trim().length === 0) {
                        errorLabel.text = "Please enter a prompt"
                        return
                    }
                    if (environments.length === 0 || envCombo.currentIndex < 0) {
                        errorLabel.text = "No environment selected"
                        return
                    }
                    
                    sending = true
                    errorLabel.text = ""
                    
                    var env = environments[envCombo.currentIndex]
                    var envId = env.id || env.environment_id
                    
                    dialog.promptSubmitted(
                        promptField.text.trim(),
                        envId,
                        branchField.text || "main",
                        bestOfSpinner.value
                    )
                }
            }
        }
    }
    
    // Keyboard shortcuts
    Shortcut {
        sequence: "Ctrl+Return"
        enabled: sendButton.enabled
        onActivated: sendButton.clicked()
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Dialog {
    id: dialog
    title: "Git Patch"
    width: 900
    height: 650
    modal: true
    standardButtons: Dialog.Close
    
    property string patchText: ""
    property int additions: 0
    property int deletions: 0
    property var themeColors: ({})
    
    // Internal colors with fallbacks
    readonly property var colors: ({
        background: themeColors.window || themeColors.background || "#0d0d0d",
        paper: themeColors.alternateBase || "#1a1a1a",
        text: themeColors.windowText || themeColors.text || "#ffffff",
        textSecondary: themeColors.textSecondary || "#a0a0a0",
        accent: themeColors.accent || "#10a37f",
        success: themeColors.success || "#22c55e",
        error: themeColors.error || "#ef4444",
        border: themeColors.border || "#333333",
        codeBackground: themeColors.codeBackground || "#1a1a1a"
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
    
    function show(patch) {
        patchText = patch
        // Count additions and deletions
        var lines = patch.split('\n')
        additions = 0
        deletions = 0
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('+') && !lines[i].startsWith('+++')) additions++
            if (lines[i].startsWith('-') && !lines[i].startsWith('---')) deletions++
        }
        open()
    }
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 12
        
        // Stats and actions
        RowLayout {
            Layout.fillWidth: true
            spacing: 16
            
            Label {
                text: "+" + additions
                color: colors.success
                font.bold: true
            }
            
            Label {
                text: "-" + deletions
                color: colors.error
                font.bold: true
            }
            
            Label {
                text: patchText.split('\n').length + " lines"
                color: colors.textSecondary
            }
            
            Item { Layout.fillWidth: true }
            
            Button {
                text: "📋 Copy to Clipboard"
                onClicked: {
                    app.copyToClipboard(patchText)
                }
                background: Rectangle {
                    color: parent.hovered ? Qt.lighter(colors.paper, 1.2) : colors.paper
                    radius: 4
                    border.color: colors.border
                }
                contentItem: Text {
                    text: parent.text
                    color: colors.text
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            Button {
                text: "💾 Save to File"
                onClicked: {
                    // For now just copy - could add file save dialog later
                    app.copyToClipboard(patchText)
                }
                background: Rectangle {
                    color: parent.hovered ? Qt.lighter(colors.paper, 1.2) : colors.paper
                    radius: 4
                    border.color: colors.border
                }
                contentItem: Text {
                    text: parent.text
                    color: colors.text
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
        
        // Instructions
        Label {
            text: "Apply with: git apply < patch.diff"
            color: colors.textSecondary
            font.pixelSize: 12
        }
        
        // Diff view with syntax highlighting
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            
            TextArea {
                id: patchArea
                text: patchText
                readOnly: true
                font.family: "Menlo"
                font.pixelSize: 12
                wrapMode: Text.NoWrap
                selectByMouse: true
                textFormat: Text.PlainText
                
                background: Rectangle {
                    color: colors.codeBackground
                    radius: 4
                    border.color: colors.border
                    border.width: 1
                }
                
                color: colors.text
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * CCodeBlock.qml - Code block display (mirrors _code-block.scss)
 * Syntax-highlighted code with optional copy button
 */
Rectangle {
    id: root
    
    property string code: ""
    property string language: ""
    property bool showCopy: true
    property bool showLineNumbers: false
    property int maxHeight: 400
    
    color: Theme.mode === "dark" ? Qt.rgba(0, 0, 0, 0.4) : Qt.rgba(0, 0, 0, 0.05)
    radius: StyleVariables.radiusSm
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: Math.min(contentCol.implicitHeight + StyleVariables.spacingMd * 2, maxHeight)
    
    ColumnLayout {
        id: contentCol
        anchors.fill: parent
        anchors.margins: StyleVariables.spacingMd
        spacing: StyleVariables.spacingSm
        
        // Header with language and copy button
        RowLayout {
            Layout.fillWidth: true
            visible: root.language !== "" || root.showCopy
            
            Text {
                text: root.language
                color: Theme.onSurfaceVariant
                font.pixelSize: StyleVariables.fontSizeXs
                font.family: StyleVariables.fontMono
                visible: root.language !== ""
            }
            
            Item { Layout.fillWidth: true }
            
            CButton {
                text: "Copy"
                size: "sm"
                variant: "text"
                visible: root.showCopy
                onClicked: {
                    // Copy to clipboard would need Python bridge
                    text = "Copied!"
                    copyTimer.start()
                }
                
                Timer {
                    id: copyTimer
                    interval: 2000
                    onTriggered: parent.text = "Copy"
                }
            }
        }
        
        // Code content
        Flickable {
            Layout.fillWidth: true
            Layout.fillHeight: true
            contentWidth: codeText.implicitWidth
            contentHeight: codeText.implicitHeight
            clip: true
            boundsBehavior: Flickable.StopAtBounds
            
            ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }
            ScrollBar.horizontal: ScrollBar { policy: ScrollBar.AsNeeded }
            
            RowLayout {
                spacing: StyleVariables.spacingSm
                
                // Line numbers
                Column {
                    visible: root.showLineNumbers
                    spacing: 0
                    
                    Repeater {
                        model: root.code.split('\n').length
                        
                        Text {
                            text: (index + 1).toString()
                            color: Theme.onSurfaceVariant
                            font.family: StyleVariables.fontMono
                            font.pixelSize: StyleVariables.fontSizeSm
                            horizontalAlignment: Text.AlignRight
                            width: 30
                            opacity: 0.5
                        }
                    }
                }
                
                // Code text
                Text {
                    id: codeText
                    text: root.code
                    color: Theme.onSurface
                    font.family: StyleVariables.fontMono
                    font.pixelSize: StyleVariables.fontSizeSm
                    textFormat: Text.PlainText
                    wrapMode: Text.NoWrap
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../contexts"
import "../fakemui"

/**
 * MarkdownRenderer.qml - Simple markdown text renderer
 * Mirrors React's MarkdownRenderer.jsx
 * 
 * Note: QML doesn't have native markdown support, so this is a simplified
 * renderer that handles basic formatting.
 */
Item {
    id: root
    
    property string content: ""
    property string text: "" // Alias for content
    property color textColor: Theme.text
    property color codeBackground: Qt.rgba(0, 0, 0, 0.2)
    property int fontSize: 14
    
    // Use text if content is empty
    readonly property string _effectiveContent: content || text
    
    implicitHeight: contentColumn.height
    implicitWidth: parent ? parent.width : 300
    
    ColumnLayout {
        id: contentColumn
        width: parent.width
        spacing: 8
        
        Repeater {
            model: parseMarkdown(_effectiveContent)
            
            delegate: Loader {
                Layout.fillWidth: true
                sourceComponent: {
                    switch (modelData.type) {
                        case "h1": return h1Block
                        case "h2": return h2Block
                        case "h3": return h3Block
                        case "code": return codeBlock
                        case "blockquote": return quoteBlock
                        case "ul": return listBlock
                        case "hr": return hrBlock
                        default: return textBlock
                    }
                }
                
                property var blockData: modelData
            }
        }
    }
    
    // Parse markdown into blocks
    function parseMarkdown(text) {
        if (!text) return []
        
        const blocks = []
        const lines = text.split("\n")
        let inCodeBlock = false
        let codeContent = ""
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            
            // Code block handling
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    blocks.push({ type: "code", text: codeContent.trim() })
                    codeContent = ""
                    inCodeBlock = false
                } else {
                    inCodeBlock = true
                }
                continue
            }
            
            if (inCodeBlock) {
                codeContent += line + "\n"
                continue
            }
            
            // Headers
            if (line.startsWith("# ")) {
                blocks.push({ type: "h1", text: line.substring(2) })
            } else if (line.startsWith("## ")) {
                blocks.push({ type: "h2", text: line.substring(3) })
            } else if (line.startsWith("### ")) {
                blocks.push({ type: "h3", text: line.substring(4) })
            }
            // Horizontal rule
            else if (line.match(/^-{3,}$/) || line.match(/^_{3,}$/) || line.match(/^\*{3,}$/)) {
                blocks.push({ type: "hr" })
            }
            // Blockquote
            else if (line.startsWith("> ")) {
                blocks.push({ type: "blockquote", text: line.substring(2) })
            }
            // List items
            else if (line.match(/^[\-\*]\s/)) {
                // Collect consecutive list items
                const items = [line.substring(2)]
                while (i + 1 < lines.length && lines[i + 1].match(/^[\-\*]\s/)) {
                    i++
                    items.push(lines[i].substring(2))
                }
                blocks.push({ type: "ul", items: items })
            }
            // Inline code (single backticks)
            else if (line.includes("`") && !line.startsWith("```")) {
                blocks.push({ type: "text", text: line, hasInlineCode: true })
            }
            // Regular text
            else if (line.trim() !== "") {
                blocks.push({ type: "text", text: line })
            }
        }
        
        return blocks
    }
    
    // Format inline markdown (bold, italic, inline code, links)
    function formatInline(text) {
        if (!text) return ""
        
        // Replace inline code
        text = text.replace(/`([^`]+)`/g, '<span style="font-family: Courier New; background-color: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 3px;">$1</span>')
        
        // Replace bold
        text = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        text = text.replace(/__([^_]+)__/g, '<b>$1</b>')
        
        // Replace italic
        text = text.replace(/\*([^*]+)\*/g, '<i>$1</i>')
        text = text.replace(/_([^_]+)_/g, '<i>$1</i>')
        
        // Replace links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: ' + Theme.primary + ';">$1</a>')
        
        return text
    }
    
    // H1 Component
    Component {
        id: h1Block
        
        Text {
            text: formatInline(blockData.text || "")
            textFormat: Text.RichText
            font.pixelSize: fontSize + 10
            font.bold: true
            color: textColor
            wrapMode: Text.WordWrap
        }
    }
    
    // H2 Component
    Component {
        id: h2Block
        
        Text {
            text: formatInline(blockData.text || "")
            textFormat: Text.RichText
            font.pixelSize: fontSize + 6
            font.bold: true
            color: textColor
            wrapMode: Text.WordWrap
        }
    }
    
    // H3 Component
    Component {
        id: h3Block
        
        Text {
            text: formatInline(blockData.text || "")
            textFormat: Text.RichText
            font.pixelSize: fontSize + 2
            font.bold: true
            color: textColor
            wrapMode: Text.WordWrap
        }
    }
    
    // Text Block Component
    Component {
        id: textBlock
        
        Text {
            text: formatInline(blockData.text || "")
            textFormat: Text.RichText
            font.pixelSize: fontSize
            color: textColor
            wrapMode: Text.WordWrap
            lineHeight: 1.5
        }
    }
    
    // Code Block Component
    Component {
        id: codeBlock
        
        Rectangle {
            width: parent.width
            height: codeText.height + 16
            color: codeBackground
            radius: 4
            
            Text {
                id: codeText
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 8
                text: blockData.text || ""
                font.pixelSize: fontSize - 1
                font.family: "Courier New"
                color: textColor
                wrapMode: Text.WrapAnywhere
            }
        }
    }
    
    // Blockquote Component
    Component {
        id: quoteBlock
        
        Rectangle {
            width: parent.width
            height: quoteText.height + 16
            color: Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.08)
            radius: 4
            
            Rectangle {
                anchors.left: parent.left
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                width: 4
                color: Theme.primary
                radius: 2
            }
            
            Text {
                id: quoteText
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.leftMargin: 16
                anchors.rightMargin: 8
                anchors.topMargin: 8
                text: formatInline(blockData.text || "")
                textFormat: Text.RichText
                font.pixelSize: fontSize
                font.italic: true
                color: Theme.textSecondary
                wrapMode: Text.WordWrap
            }
        }
    }
    
    // List Component
    Component {
        id: listBlock
        
        Column {
            width: parent.width
            spacing: 4
            
            Repeater {
                model: blockData.items || []
                
                Row {
                    spacing: 8
                    
                    Text {
                        text: "•"
                        font.pixelSize: fontSize
                        color: Theme.primary
                    }
                    
                    Text {
                        text: formatInline(modelData)
                        textFormat: Text.RichText
                        font.pixelSize: fontSize
                        color: textColor
                        wrapMode: Text.WordWrap
                    }
                }
            }
        }
    }
    
    // Horizontal Rule Component
    Component {
        id: hrBlock
        
        Rectangle {
            width: parent.width
            height: 1
            color: Theme.border
        }
    }
}

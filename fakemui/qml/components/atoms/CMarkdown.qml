import QtQuick

/**
 * CMarkdown.qml - Markdown text display (mirrors _markdown.scss)
 * Renders markdown-formatted text using Qt's built-in support
 */
Text {
    id: root
    
    property string markdown: ""
    
    text: markdown
    textFormat: Text.MarkdownText
    color: Theme.onSurface
    font.pixelSize: StyleVariables.fontSizeMd
    wrapMode: Text.Wrap
    lineHeight: 1.6
    
    // Link styling
    linkColor: Theme.primary
    onLinkActivated: (link) => Qt.openUrlExternally(link)
    
    // Cursor for links
    MouseArea {
        anchors.fill: parent
        acceptedButtons: Qt.NoButton
        cursorShape: parent.hoveredLink ? Qt.PointingHandCursor : Qt.ArrowCursor
    }
}

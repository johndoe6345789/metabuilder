import QtQuick
import QmlComponents 1.0

/**
 * CMarkdown.qml - Material Design 3 markdown text display
 * Renders markdown-formatted text with MD3 typography
 */
Text {
    id: root

    property string markdown: ""

    text: markdown
    textFormat: Text.MarkdownText
    color: Theme.text
    font.pixelSize: 16
    font.letterSpacing: 0.5
    wrapMode: Text.Wrap
    lineHeight: 1.6
    lineHeightMode: Text.ProportionalHeight

    // MD3 primary link color
    linkColor: Theme.primary
    onLinkActivated: (link) => Qt.openUrlExternally(link)

    // Cursor for links
    MouseArea {
        anchors.fill: parent
        acceptedButtons: Qt.NoButton
        cursorShape: parent.hoveredLink ? Qt.PointingHandCursor : Qt.ArrowCursor
    }
}

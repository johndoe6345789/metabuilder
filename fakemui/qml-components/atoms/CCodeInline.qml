import QtQuick

/**
 * CCodeInline.qml - Inline code (mirrors _code-inline.scss)
 * Small inline code snippets
 */
Rectangle {
    id: root
    
    property alias text: label.text
    property alias textColor: label.color
    
    color: Theme.mode === "dark" ? Qt.rgba(255, 255, 255, 0.1) : Qt.rgba(0, 0, 0, 0.06)
    radius: StyleVariables.radiusSm
    
    implicitWidth: label.implicitWidth + StyleVariables.spacingSm * 2
    implicitHeight: label.implicitHeight + StyleVariables.spacingXs
    
    Text {
        id: label
        anchors.centerIn: parent
        color: Theme.onSurface
        font.family: StyleVariables.fontMono
        font.pixelSize: StyleVariables.fontSizeSm * 0.9
    }
}

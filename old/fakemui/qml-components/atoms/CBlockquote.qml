import QtQuick
import QtQuick.Layouts

/**
 * CBlockquote.qml - Blockquote (mirrors _blockquote.scss)
 * Styled quote block with left border
 */
Rectangle {
    id: root
    
    property string text: ""
    property string cite: ""
    
    color: Theme.mode === "dark" ? Qt.rgba(255, 255, 255, 0.03) : Qt.rgba(0, 0, 0, 0.02)
    radius: StyleVariables.radiusSm
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: contentCol.implicitHeight + StyleVariables.spacingMd * 2
    
    // Left accent border
    Rectangle {
        width: 4
        height: parent.height
        color: Theme.primary
        radius: 2
    }
    
    ColumnLayout {
        id: contentCol
        anchors.fill: parent
        anchors.leftMargin: StyleVariables.spacingMd + 4
        anchors.rightMargin: StyleVariables.spacingMd
        anchors.topMargin: StyleVariables.spacingMd
        anchors.bottomMargin: StyleVariables.spacingMd
        spacing: StyleVariables.spacingSm
        
        Text {
            Layout.fillWidth: true
            text: root.text
            color: Theme.onSurface
            font.pixelSize: StyleVariables.fontSizeMd
            font.italic: true
            wrapMode: Text.Wrap
            lineHeight: 1.6
        }
        
        Text {
            Layout.fillWidth: true
            text: "— " + root.cite
            color: Theme.onSurfaceVariant
            font.pixelSize: StyleVariables.fontSizeSm
            visible: root.cite !== ""
        }
    }
}

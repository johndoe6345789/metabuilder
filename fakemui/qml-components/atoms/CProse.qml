import QtQuick
import QtQuick.Layouts

/**
 * CProse.qml - Long-form text container (mirrors _prose.scss)
 * Optimized typography for reading
 */
ColumnLayout {
    id: root
    
    property string size: "md"           // sm, md, lg
    property real maxWidth: 680          // Optimal reading width
    
    default property alias content: contentItem.data
    
    spacing: StyleVariables.spacingMd
    
    // Content container with max-width
    Item {
        id: contentItem
        Layout.fillWidth: true
        Layout.maximumWidth: root.maxWidth
        Layout.alignment: Qt.AlignHCenter
        implicitHeight: childrenRect.height
        
        // Apply prose styles to child Text elements
        Component.onCompleted: {
            for (var i = 0; i < children.length; i++) {
                var child = children[i]
                if (child instanceof Text) {
                    applyProseStyle(child)
                }
            }
        }
    }
    
    function applyProseStyle(textItem) {
        textItem.color = Theme.onSurface
        textItem.wrapMode = Text.Wrap
        textItem.lineHeight = 1.7
        
        switch (size) {
            case "sm":
                textItem.font.pixelSize = StyleVariables.fontSizeSm
                break
            case "lg":
                textItem.font.pixelSize = StyleVariables.fontSizeLg
                break
            default:
                textItem.font.pixelSize = StyleVariables.fontSizeMd
        }
    }
}

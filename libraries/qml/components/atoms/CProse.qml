import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CProse.qml - Material Design 3 long-form text container
 * Rich text container with proper line-height and typography
 */
ColumnLayout {
    id: root

    property string size: "md"           // sm, md, lg
    property real maxWidth: 680          // Optimal reading width

    default property alias content: contentItem.data

    spacing: 16

    // Content container with max-width
    Item {
        id: contentItem
        Layout.fillWidth: true
        Layout.maximumWidth: root.maxWidth
        Layout.alignment: Qt.AlignHCenter
        implicitHeight: childrenRect.height

        // Apply MD3 prose styles to child Text elements
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
        textItem.color = Theme.text
        textItem.wrapMode = Text.Wrap
        textItem.lineHeight = 1.6
        textItem.lineHeightMode = Text.ProportionalHeight
        textItem.font.letterSpacing = 0.5

        switch (size) {
            case "sm":
                textItem.font.pixelSize = 14
                break
            case "lg":
                textItem.font.pixelSize = 18
                break
            default:
                textItem.font.pixelSize = 16
        }
    }
}

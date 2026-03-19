import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../theming"

Row {
    id: root

    property var items: []        // ["Home", "Settings", "Profile"]
    property string separator: "/" // "/" or ">"

    signal itemClicked(int index, string label)

    spacing: 0

    Repeater {
        model: root.items

        Row {
            spacing: 0

            // Breadcrumb item — last item is plain text, others are clickable
            Text {
                id: crumbText
                text: modelData
                font.pixelSize: 14
                font.weight: Font.Medium
                color: {
                    if (index === root.items.length - 1)
                        return Theme.text
                    if (crumbMouse.containsMouse)
                        return Theme.primary
                    return Theme.textSecondary
                }
                opacity: index === root.items.length - 1
                    ? 1.0 : (crumbMouse.containsMouse ? 1.0 : 0.9)
                verticalAlignment: Text.AlignVCenter

                Behavior on color { ColorAnimation { duration: 150 } }

                MouseArea {
                    id: crumbMouse
                    anchors.fill: parent
                    hoverEnabled: index < root.items.length - 1
                    cursorShape: index < root.items.length - 1
                        ? Qt.PointingHandCursor : Qt.ArrowCursor
                    enabled: index < root.items.length - 1
                    onClicked: root.itemClicked(index, modelData)
                }
            }

            // Separator — not shown after last item
            Text {
                text: " " + root.separator + " "
                font.pixelSize: 14
                color: Theme.textSecondary
                visible: index < root.items.length - 1
                verticalAlignment: Text.AlignVCenter
            }
        }
    }
}

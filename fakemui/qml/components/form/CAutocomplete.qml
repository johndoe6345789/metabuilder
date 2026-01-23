import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * CAutocomplete.qml - simple autocomplete input with popup suggestions
 */
Item {
    id: root
    width: 300
    property alias text: input.text
    property var suggestions: []
    property Component delegate: null
    signal accepted(string value)

    TextField {
        id: input
        anchors.left: parent.left
        anchors.right: parent.right
        placeholderText: "Type to search..."
        onTextChanged: {
            popup.open()
        }
        onAccepted: root.accepted(text)
    }

    Popup {
        id: popup
        x: input.mapToItem(root, 0, input.height).x
        y: input.mapToItem(root, 0, input.height).y
        width: input.width
        modal: false
        focus: true

        Rectangle {
            width: parent.width
            color: Theme.surface
            radius: StyleVariables.radiusSm
            border.color: Theme.divider

            ListView {
                id: list
                width: parent.width
                model: root.suggestions
                delegate: root.delegate ? root.delegate : ItemDelegate { text: modelData; onClicked: { root.input.text = modelData; popup.close(); root.accepted(modelData); } }
                clip: true
                interactive: true
                height: Math.min(200, contentHeight)
            }
        }
    }
}

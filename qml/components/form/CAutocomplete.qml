import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CAutocomplete.qml - Material Design 3 autocomplete input with popup
 // suggestions
 * TextField + dropdown popup with 8px radius, surface background, and elevation
 */
Item {
    id: root
    width: 300
    implicitHeight: input.height

    property alias text: input.text
    property var suggestions: []
    property Component delegate: null
    property string placeholderText: "Type to search..."
    property bool loading: false

    signal accepted(string value)

    TextField {
        id: input
        anchors.left: parent.left
        anchors.right: parent.right
        placeholderText: root.placeholderText

        // Accessibility
        Accessible.role: Accessible.EditableText
        Accessible.name:
            root.placeholderText || ""
        Accessible.description: ""
        activeFocusOnTab: true
        objectName: "input_autocomplete"
        color: Theme.text
        font.pixelSize: 14
        font.family: Theme.fontFamily
        placeholderTextColor: Theme.textSecondary

        background: Rectangle {
            radius: 8
            color: Theme.surface
            border.width: input.activeFocus ? 2 : 1
            border.color: input.activeFocus ? Theme.primary : Theme.border

            Behavior on border.color {
                ColorAnimation { duration: Theme.transitionShortest }
            }
            Behavior on border.width {
                NumberAnimation { duration: Theme.transitionShortest }
            }
        }

        onTextChanged: {
            if (text.length > 0 && root.suggestions.length > 0) {
                popup.open()
            } else {
                popup.close()
            }
        }
        onAccepted: root.accepted(text)
    }

    Popup {
        id: popup
        y: input.height + 4
        width: input.width
        modal: false
        focus: false
        closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
        padding: 0

        background: Rectangle {
            color: Theme.surface
            radius: 8
            border.color: Theme.border
            border.width: 1

            // MD3 elevation shadow
            layer.enabled: true
            layer.effect: Item {
                Rectangle {
                    anchors.fill: parent
                    anchors.margins: -2
                    radius: 10
                    color: "transparent"
                    border.color: "transparent"

                    Rectangle {
                        anchors.fill: parent
                        anchors.topMargin: 2
                        radius: 10
                        color: Theme.shadowColor
                        opacity: 0.15
                    }
                }
            }
        }

        contentItem: ListView {
            id: list
            implicitHeight: Math.min(240, contentHeight)
            model: root.suggestions
            clip: true
            interactive: true
            boundsBehavior: Flickable.StopAtBounds

            delegate: root.delegate ? root.delegate : defaultDelegate
        }
    }

    Component {
        id: defaultDelegate

        Rectangle {
            width: list.width
            height: 48
            color: delegateMouseArea.containsMouse
                ? Theme.actionHover : "transparent"
            radius: 0

            Text {
                id: delegateText
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                text: modelData
                color: Theme.text
                font.pixelSize: 14
                font.family: Theme.fontFamily
                elide: Text.ElideRight
            }

            // Highlight matching text overlay
            Text {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                font.pixelSize: 14
                font.family: Theme.fontFamily
                elide: Text.ElideRight
                color: "transparent"
                visible: input.text.length > 0

                // Build rich text with highlighted match
                textFormat: Text.RichText
                text: {
                    var src = modelData
                    var query = input.text.toLowerCase()
                    var idx = src.toLowerCase().indexOf(query)
                    if (idx < 0) return ""
                    var before = src.substring(0, idx)
                    var match = src.substring(idx, idx + query.length)
                    var after = src.substring(idx + query.length)
                    return before + "<font color='" + Theme.primary + "'>" +
                        match + "</font>" + after
                }
            }

            // Second pass: draw the full text with highlighted portion
            Text {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                font.pixelSize: 14
                font.family: Theme.fontFamily
                elide: Text.ElideRight
                textFormat: Text.RichText
                visible: input.text.length > 0
                text: {
                    var src = modelData
                    var query = input.text.toLowerCase()
                    var idx = src.toLowerCase().indexOf(query)
                    if (idx < 0) return "<font color='" + Theme.text + "'>" +
                        src + "</font>"
                    var before = src.substring(0, idx)
                    var match = src.substring(idx, idx + query.length)
                    var after = src.substring(idx + query.length)
                    return "<font color='" + Theme.text + "'>" + before +
                        "</font>"
                         + "<font color='" + Theme.primary + "'><b>" + match +
                             "</b></font>"
                         + "<font color='" + Theme.text + "'>" + after +
                             "</font>"
                }
            }

            // Hide plain text when highlighted version is showing
            Component.onCompleted: {
                delegateText.visible = Qt.binding(
                    function() { return input.text.length === 0 })
            }

            MouseArea {
                id: delegateMouseArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    root.text = modelData
                    popup.close()
                    root.accepted(modelData)
                }
            }

            // State layer ripple on press
            Rectangle {
                anchors.fill: parent
                color: Theme.primary
                opacity: delegateMouseArea.pressed ? 0.12 : 0
                Behavior on opacity {
                    NumberAnimation { duration: Theme.transitionShortest }
                }
            }
        }
    }
}

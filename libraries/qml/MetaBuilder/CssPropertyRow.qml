import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Item {
    id: root
    height: 48

    property string propName: ""
    property string propValue: ""
    property bool isFirst: false
    property var suggestions: []
    property bool suggestionsShown: false

    signal propNameEdited(string name)
    signal propValueEdited(string value)
    signal removeClicked()
    signal focusGained()
    signal focusLost()
    signal suggestionPicked(string value)

    RowLayout {
        anchors.fill: parent
        spacing: 8

        Item {
            Layout.preferredWidth: 200
            Layout.fillHeight: true

            CTextField {
                id: propNameField
                anchors.fill: parent
                label: root.isFirst ? "Property" : ""
                placeholderText: "property-name"
                text: root.propName
                onTextChanged: {
                    if (text !== root.propName)
                        root.propNameEdited(text)
                }
                onActiveFocusChanged: {
                    if (activeFocus) root.focusGained()
                    else root.focusLost()
                }
            }

            CssSuggestionPopup {
                anchors.top: propNameField.bottom
                anchors.left: propNameField.left
                width: propNameField.width
                suggestions: root.suggestions
                shown: root.suggestionsShown
                onSuggestionClicked: function(value) {
                    root.suggestionPicked(value)
                }
            }
        }

        CTextField {
            Layout.fillWidth: true
            Layout.fillHeight: true
            label: root.isFirst ? "Value" : ""
            placeholderText: "#000000"
            text: root.propValue
            onTextChanged: {
                if (text !== root.propValue)
                    root.propValueEdited(text)
            }
        }

        Rectangle {
            Layout.preferredWidth: 24
            Layout.preferredHeight: 24
            Layout.alignment: Qt.AlignVCenter
            radius: 4
            border.color: Theme.border
            border.width: 1
            color: {
                var v = root.propValue
                if (v.charAt(0) === "#" || v.indexOf("rgb") === 0)
                    return v
                return "transparent"
            }
            visible: root.propName === "color" ||
                root.propName === "background-color"
        }

        CButton {
            text: "x"
            variant: "ghost"
            size: "sm"
            onClicked: root.removeClicked()
        }
    }
}

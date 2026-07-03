import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    property var selectedClass: null
    property var propertySuggestions: []

    signal classNameChanged(string name)
    signal deleteClassClicked()
    signal addPropertyClicked()
    signal removePropertyClicked(int propIndex)
    signal propertyNameChanged(int propIndex, string name)
    signal propertyValueChanged(int propIndex, string value)

    property bool showSuggestions: false
    property int editingPropertyIndex: -1

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CTextField {
                Layout.preferredWidth: 260
                label: "Class Name"
                placeholderText: ".class-name"
                text: root.selectedClass ? root.selectedClass.name : ""
                onTextChanged: {
                    if (root.selectedClass && text !== root.selectedClass.name)
                        root.classNameChanged(text)
                }
            }

            Item { Layout.fillWidth: true }

            CButton {
                text: "Delete Class"
                variant: "danger"
                size: "sm"
                onClicked: root.deleteClassClicked()
            }
        }

        CDivider { Layout.fillWidth: true }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText { variant: "h4"; text: "Properties" }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Add Property"
                variant: "primary"
                size: "sm"
                onClicked: root.addPropertyClicked()
            }
        }

        ListView {
            id: propertyListView
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.selectedClass ? root.selectedClass.properties : []
            spacing: 6
            clip: true

            delegate: CssPropertyRow {
                width: propertyListView.width
                propName: modelData.prop
                propValue: modelData.value
                isFirst: index === 0
                suggestions: root.propertySuggestions
                suggestionsShown: root.showSuggestions &&
                    root.editingPropertyIndex === index
                onPropNameEdited: function(
                    name) { root.propertyNameChanged(index, name) }
                onPropValueEdited: function(
                    value) { root.propertyValueChanged(index, value) }
                onRemoveClicked: root.removePropertyClicked(index)
                onFocusGained: { root.editingPropertyIndex = index
                root.showSuggestions = true }
                onFocusLost: suggestHideTimer.start()
                onSuggestionPicked: function(value) {
                    root.propertyNameChanged(root.editingPropertyIndex, value)
                    root.showSuggestions = false
                }
            }
        }
    }

    Timer {
        id: suggestHideTimer
        interval: 200
        onTriggered: root.showSuggestions = false
    }
}

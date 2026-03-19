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
        anchors.fill: parent
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

            delegate: Item {
                width: propertyListView.width
                height: 48

                RowLayout {
                    anchors.fill: parent
                    spacing: 8

                    Item {
                        Layout.preferredWidth: 200
                        Layout.fillHeight: true

                        CTextField {
                            id: propNameField
                            anchors.fill: parent
                            label: index === 0 ? "Property" : ""
                            placeholderText: "property-name"
                            text: modelData.prop
                            onTextChanged: {
                                if (text !== modelData.prop)
                                    root.propertyNameChanged(index, text)
                            }
                            onActiveFocusChanged: {
                                if (activeFocus) {
                                    root.editingPropertyIndex = index
                                    root.showSuggestions = true
                                } else {
                                    suggestHideTimer.start()
                                }
                            }
                        }

                        CssSuggestionPopup {
                            anchors.top: propNameField.bottom
                            anchors.left: propNameField.left
                            width: propNameField.width
                            suggestions: root.propertySuggestions
                            shown: root.showSuggestions && root.editingPropertyIndex === index
                            onSuggestionClicked: function(value) {
                                root.propertyNameChanged(root.editingPropertyIndex, value)
                                root.showSuggestions = false
                            }
                        }
                    }

                    CTextField {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        label: index === 0 ? "Value" : ""
                        placeholderText: "#000000"
                        text: modelData.value
                        onTextChanged: {
                            if (text !== modelData.value)
                                root.propertyValueChanged(index, text)
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
                            var v = modelData.value
                            if (v.charAt(0) === "#" || v.indexOf("rgb") === 0)
                                return v
                            return "transparent"
                        }
                        visible: modelData.prop === "color" || modelData.prop === "background-color"
                    }

                    CButton {
                        text: "x"
                        variant: "ghost"
                        size: "sm"
                        onClicked: root.removePropertyClicked(index)
                    }
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

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CPaper {
    id: root

    property var dropdown: null
    implicitHeight: previewColumn.implicitHeight + 32

    ColumnLayout {
        id: previewColumn
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        CText {
            variant: "caption"
            text: "This is how the dropdown will render in forms:"
            color: Theme.text
            opacity: 0.6
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            CText {
                variant: "body2"
                text: (root.dropdown ? root.dropdown.name : "") + (root.dropdown && root.dropdown.required ? " *" : "")
                font.bold: true
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 40
                color: Theme.surface
                border.color: Theme.border
                border.width: 1
                radius: 4

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 8

                    CText {
                        variant: "body1"
                        text: root.dropdown && root.dropdown.options.length > 0
                            ? root.dropdown.options[0].label
                            : "No options"
                        Layout.fillWidth: true
                        color: Theme.text
                    }
                    CText {
                        variant: "body2"
                        text: "\u25BE"
                        color: Theme.text
                        opacity: 0.5
                    }
                }
            }

            CText {
                variant: "caption"
                text: root.dropdown ? root.dropdown.description : ""
                color: Theme.text
                opacity: 0.5
            }
        }

        CDivider { Layout.fillWidth: true }

        CText {
            variant: "caption"
            text: "Expanded view:"
            color: Theme.text
            opacity: 0.6
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: previewOptionsList.implicitHeight + 8
            color: Theme.surface
            border.color: Theme.border
            border.width: 1
            radius: 4

            ColumnLayout {
                id: previewOptionsList
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 4
                spacing: 0

                Repeater {
                    model: root.dropdown ? root.dropdown.options : []

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 36
                        color: optMouse.containsMouse ? Theme.primary : "transparent"
                        opacity: optMouse.containsMouse ? 0.12 : 1.0
                        radius: 2

                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12
                            anchors.rightMargin: 12
                            spacing: 8

                            CText {
                                variant: "body1"
                                text: modelData.label
                                Layout.fillWidth: true
                            }
                            CText {
                                variant: "caption"
                                text: modelData.value
                                color: Theme.text
                                opacity: 0.4
                            }
                        }

                        MouseArea {
                            id: optMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                        }
                    }
                }
            }
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CBadge { text: root.dropdown ? root.dropdown.options.length + " options" : "0 options" }
            CBadge {
                text: root.dropdown && root.dropdown.required ? "Required" : "Optional"
                accent: root.dropdown ? root.dropdown.required : false
            }
            CBadge {
                text: root.dropdown && root.dropdown.allowCustom ? "Custom values OK" : "Fixed options only"
            }
        }
    }
}

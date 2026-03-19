import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true
    Layout.fillHeight: true

    property bool hasSelection: false
    property string templateName: ""
    property string templateSubject: ""
    property string templateBody: ""

    signal nameChanged(string value)
    signal subjectChanged(string value)
    signal bodyChanged(string value)
    signal saveRequested()

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText { variant: "h4"; text: "Template Editor" }

            Item { Layout.fillWidth: true }

            CButton {
                visible: root.hasSelection
                text: "Save Template"
                variant: "primary"
                size: "sm"
                onClicked: root.saveRequested()
            }
        }

        CDivider { Layout.fillWidth: true }

        CText {
            visible: !root.hasSelection
            variant: "body2"
            text: "Select a template from the list to edit."
            Layout.alignment: Qt.AlignHCenter
            Layout.topMargin: 40
        }

        ColumnLayout {
            visible: root.hasSelection
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 12

            CTextField {
                Layout.fillWidth: true
                label: "Template Name"
                placeholderText: "e.g. Welcome Email"
                text: root.templateName
                onTextChanged: root.nameChanged(text)
            }

            CTextField {
                Layout.fillWidth: true
                label: "Subject Template"
                placeholderText: "e.g. Welcome to {{app_name}}"
                text: root.templateSubject
                onTextChanged: root.subjectChanged(text)
            }

            ColumnLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 4

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CText { variant: "caption"; text: "Body Template" }
                    Item { Layout.fillWidth: true }
                    CText {
                        variant: "caption"
                        text: "Supports {{variable}} placeholders"
                    }
                }

                Rectangle {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.minimumHeight: 180
                    color: Theme.surface
                    border.color: Theme.border
                    border.width: 1
                    radius: 4

                    ScrollView {
                        anchors.fill: parent
                        anchors.margins: 8

                        TextArea {
                            text: root.templateBody
                            wrapMode: Text.Wrap
                            color: Theme.text
                            font.pixelSize: 13
                            font.family: "monospace"
                            background: null
                            onTextChanged: root.bodyChanged(text)
                        }
                    }
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true

    property string recipient: ""
    property string subject: "MetaBuilder SMTP Test"
    property string body: "This is a test email from MetaBuilder."
    property bool sending: false

    signal recipientEdited(string value)
    signal subjectEdited(string value)
    signal bodyEdited(string value)
    signal sendRequested()

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        CText { variant: "h4"; text: "Send Test Email" }
        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            CTextField {
                Layout.fillWidth: true
                label: "Recipient"
                placeholderText: "test@example.com"
                text: root.recipient
                onTextChanged: root.recipientEdited(text)
            }

            CTextField {
                Layout.fillWidth: true
                label: "Subject"
                placeholderText: "Test subject"
                text: root.subject
                onTextChanged: root.subjectEdited(text)
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            CText { variant: "caption"; text: "Body" }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 100
                color: Theme.surface
                border.color: Theme.border
                border.width: 1
                radius: 4

                ScrollView {
                    Layout.fillWidth: true
                    anchors.margins: 8

                    TextArea {
                        text: root.body
                        wrapMode: Text.Wrap
                        color: Theme.text
                        font.pixelSize: 13
                        background: null
                        onTextChanged: root.bodyEdited(text)
                    }
                }
            }
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CButton {
                text: root.sending ? "Sending..." : "Send Test Email"
                variant: "primary"
                size: "sm"
                enabled: !root.sending && root.recipient.length > 0
                onClicked: root.sendRequested()
            }

            CText {
                visible: root.recipient.length === 0
                variant: "caption"
                text: "Enter a recipient to enable sending"
            }
        }
    }
}

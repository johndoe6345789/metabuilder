import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true
    Layout.preferredWidth: 1
    Layout.alignment: Qt.AlignTop

    property string fromName: ""
    property string fromEmail: ""

    signal fromNameEdited(string value)
    signal fromEmailEdited(string value)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        CText { variant: "h4"; text: "Sender" }
        CDivider { Layout.fillWidth: true }

        CTextField {
            Layout.fillWidth: true
            label: "From Name"
            placeholderText: "MetaBuilder"
            text: root.fromName
            onTextChanged: root.fromNameEdited(text)
        }

        CTextField {
            Layout.fillWidth: true
            label: "From Email"
            placeholderText: "noreply@example.com"
            text: root.fromEmail
            onTextChanged: root.fromEmailEdited(text)
        }

        CDivider { Layout.fillWidth: true }

        CText { variant: "caption"; text: "Preview" }

        CPaper {
            Layout.fillWidth: true

            CText {
                Layout.fillWidth: true
                anchors.margins: 12
                variant: "body2"
                text: root.fromName + " <" + root.fromEmail + ">"
            }
        }
    }
}

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

    signal fromNameChanged(string value)
    signal fromEmailChanged(string value)

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        CText { variant: "h4"; text: "Sender" }
        CDivider { Layout.fillWidth: true }

        CTextField {
            Layout.fillWidth: true
            label: "From Name"
            placeholderText: "MetaBuilder"
            text: root.fromName
            onTextChanged: root.fromNameChanged(text)
        }

        CTextField {
            Layout.fillWidth: true
            label: "From Email"
            placeholderText: "noreply@example.com"
            text: root.fromEmail
            onTextChanged: root.fromEmailChanged(text)
        }

        CDivider { Layout.fillWidth: true }

        CText { variant: "caption"; text: "Preview" }

        CPaper {
            Layout.fillWidth: true

            CText {
                anchors.fill: parent
                anchors.margins: 12
                variant: "body2"
                text: root.fromName + " <" + root.fromEmail + ">"
            }
        }
    }
}

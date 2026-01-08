import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: contact
    radius: 14
    color: "#0b1121"
    border.color: "#1d2a42"
    border.width: 1
    padding: 22

    signal submitRequested(string name, string company, string email)

    ColumnLayout {
        anchors.fill: parent
        spacing: 16

        Text {
            text: "Start a project"
            font.pixelSize: 22
            color: "#ffffff"
        }

        Text {
            text: "Share your stack vision and MetaBuilder will map it to seeds, workflows, and runtime automation."
            font.pixelSize: 16
            color: "#aeb8cf"
            wrapMode: Text.Wrap
        }

        RowLayout {
            spacing: 10

            TextField {
                id: nameInput
                placeholderText: "Your name"
                Layout.fillWidth: true
            }

            TextField {
                id: companyInput
                placeholderText: "Company"
                Layout.fillWidth: true
            }

            TextField {
                id: emailInput
                placeholderText: "Email"
                Layout.fillWidth: true
            }
        }

        Button {
            text: "Schedule a call"
            font.pixelSize: 16
            background: Rectangle {
                radius: 10
                color: "#5a7dff"
            }
            onClicked: contact.submitRequested(nameInput.text, companyInput.text, emailInput.text)
        }
    }
}

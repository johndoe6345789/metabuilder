import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var users: []
    property var allUsers: []

    signal editClicked(int uid)
    signal deleteClicked(int uid)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 0

        Rectangle {
            Layout.fillWidth: true
            height: 40
            color: Theme.surface
            radius: 4

            RowLayout {
                Layout.fillWidth: true
                anchors.leftMargin: 12
                anchors.rightMargin: 12
                spacing: 8

                CText {
                    variant: "caption"
                    text: "AVATAR"
                    Layout.preferredWidth: 56
                }
                CText {
                    variant: "caption"
                    text: "USERNAME"
                    Layout.preferredWidth: 120
                }
                CText {
                    variant: "caption"
                    text: "EMAIL"
                    Layout.fillWidth: true
                }
                CText {
                    variant: "caption"
                    text: "ROLE"
                    Layout.preferredWidth: 100
                }
                CText {
                    variant: "caption"
                    text: "LEVEL"
                    Layout.preferredWidth: 50
                }
                CText {
                    variant: "caption"
                    text: "STATUS"
                    Layout.preferredWidth: 90
                }
                CText {
                    variant: "caption"
                    text: "CREATED"
                    Layout.preferredWidth: 100
                }
                CText {
                    variant: "caption"
                    text: "ACTIONS"
                    Layout.preferredWidth: 140
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.users
            clip: true
            spacing: 0

            delegate: UserTableRow {
                width: parent ? parent.width : 600
                onEditClicked: (uid) => root.editClicked(uid)
                onDeleteClicked: (uid) => root.deleteClicked(uid)
            }
        }

        CText {
            visible: (root.users || []).length === 0
            Layout.fillWidth: true
            Layout.topMargin: 24
            variant: "body2"
            text: "No users match the current filter."
            horizontalAlignment: Text.AlignHCenter
        }
    }
}

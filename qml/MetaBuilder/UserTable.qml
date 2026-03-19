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

    function roleColor(role) {
        if (role === "supergod") return "#e040fb"
        if (role === "god")      return "#ff9800"
        if (role === "admin")    return "#2196f3"
        return "#4caf50"
    }

    function statusString(s) { return s === "active" ? "success" : "warning" }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 0

        Rectangle {
            Layout.fillWidth: true
            height: 40
            color: Theme.surface
            radius: 4

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 12
                spacing: 8

                CText { variant: "caption"; text: "AVATAR";   Layout.preferredWidth: 56 }
                CText { variant: "caption"; text: "USERNAME"; Layout.preferredWidth: 120 }
                CText { variant: "caption"; text: "EMAIL";    Layout.fillWidth: true }
                CText { variant: "caption"; text: "ROLE";     Layout.preferredWidth: 100 }
                CText { variant: "caption"; text: "LEVEL";    Layout.preferredWidth: 50 }
                CText { variant: "caption"; text: "STATUS";   Layout.preferredWidth: 90 }
                CText { variant: "caption"; text: "CREATED";  Layout.preferredWidth: 100 }
                CText { variant: "caption"; text: "ACTIONS";  Layout.preferredWidth: 140 }
            }
        }

        CDivider { Layout.fillWidth: true }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.users
            clip: true
            spacing: 0

            delegate: Rectangle {
                width: parent ? parent.width : 600
                height: 56
                color: index % 2 === 0 ? "transparent" : Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.3)

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 8

                    Item {
                        Layout.preferredWidth: 56
                        Layout.preferredHeight: 40

                        CAvatar {
                            anchors.centerIn: parent
                            initials: modelData.username.substring(0, 2).toUpperCase()
                        }
                    }

                    CText {
                        variant: "body1"
                        text: modelData.username
                        Layout.preferredWidth: 120
                        elide: Text.ElideRight
                    }

                    CText {
                        variant: "body2"
                        text: modelData.email
                        Layout.fillWidth: true
                        elide: Text.ElideRight
                    }

                    Item {
                        Layout.preferredWidth: 100
                        Layout.preferredHeight: 40

                        CBadge {
                            anchors.verticalCenter: parent.verticalCenter
                            text: modelData.role
                            badgeColor: roleColor(modelData.role)
                        }
                    }

                    CText {
                        variant: "body2"
                        text: "L" + modelData.level
                        Layout.preferredWidth: 50
                    }

                    Item {
                        Layout.preferredWidth: 90
                        Layout.preferredHeight: 40

                        CStatusBadge {
                            anchors.verticalCenter: parent.verticalCenter
                            status: statusString(modelData.status)
                            text: modelData.status
                        }
                    }

                    CText {
                        variant: "caption"
                        text: modelData.created
                        Layout.preferredWidth: 100
                    }

                    FlexRow {
                        Layout.preferredWidth: 140
                        spacing: 6

                        CButton {
                            text: "Edit"
                            variant: "ghost"
                            size: "sm"
                            onClicked: root.editClicked(modelData.uid)
                        }
                        CButton {
                            text: "Delete"
                            variant: "danger"
                            size: "sm"
                            onClicked: root.deleteClicked(modelData.uid)
                        }
                    }
                }
            }
        }

        CText {
            visible: root.users.length === 0
            Layout.fillWidth: true
            Layout.topMargin: 24
            variant: "body2"
            text: "No users match the current filter."
            horizontalAlignment: Text.AlignHCenter
        }
    }
}

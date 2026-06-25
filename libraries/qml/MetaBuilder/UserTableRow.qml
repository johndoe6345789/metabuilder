import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    required property var modelData
    required property int index
    signal editClicked(int uid)
    signal deleteClicked(int uid)

    function roleColor(role) {
        if (role === "supergod") return "#e040fb"
        if (role === "god")      return "#ff9800"
        if (role === "admin")    return "#2196f3"
        return "#4caf50"
    }
    function statusString(s) { return s === "active" ? "success" : "warning" }

    height: 56
    color: index % 2 === 0
        ? "transparent"
        : Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.3)

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12; anchors.rightMargin: 12
        spacing: 8

        Item {
            Layout.preferredWidth: 56; Layout.preferredHeight: 40
            CAvatar {
                anchors.centerIn: parent
                initials: modelData.username.substring(0, 2).toUpperCase()
            }
        }
        CText {
            variant: "body1"; text: modelData.username
            Layout.preferredWidth: 120; elide: Text.ElideRight
        }
        CText {
            variant: "body2"; text: modelData.email
            Layout.fillWidth: true; elide: Text.ElideRight
        }
        Item {
            Layout.preferredWidth: 100; Layout.preferredHeight: 40
            CBadge {
                anchors.verticalCenter: parent.verticalCenter
                text: modelData.role; badgeColor: root.roleColor(modelData.role)
            }
        }
        CText {
            variant: "body2"; text: "L" + modelData.level
            Layout.preferredWidth: 50
        }
        Item {
            Layout.preferredWidth: 90; Layout.preferredHeight: 40
            CStatusBadge {
                anchors.verticalCenter: parent.verticalCenter
                status: root.statusString(modelData.status)
                text: modelData.status
            }
        }
        CText {
            variant: "caption"; text: modelData.created
            Layout.preferredWidth: 100
        }
        FlexRow {
            Layout.preferredWidth: 140; spacing: 6
            CButton {
                text: "Edit"; variant: "ghost"; size: "sm"
                onClicked: root.editClicked(modelData.uid)
            }
            CButton {
                text: "Delete"; variant: "danger"; size: "sm"
                onClicked: root.deleteClicked(modelData.uid)
            }
        }
    }
}

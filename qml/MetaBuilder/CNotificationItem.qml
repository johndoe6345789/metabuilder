import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    Layout.fillWidth: true
    height: notifContent.implicitHeight + 24
    radius: 6

    property var notification
    property bool isRead: notification ? notification.read : true

    signal markRead()
    signal dismiss()

    color: isRead
        ? "transparent"
        : Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.04)

    function typeColor(type) {
        switch (type) {
            case "system":  return "#2196f3"
            case "alert":   return "#f44336"
            case "warning": return "#ff9800"
            case "info":    return "#4caf50"
            default:        return "#9e9e9e"
        }
    }

    function formatTimestamp(ts) {
        if (ts.indexOf("2026-03-18") === 0) return "Today " + ts.substring(11)
        if (ts.indexOf("2026-03-17") === 0) return "Yesterday " +
            ts.substring(11)
        return ts
    }

    Rectangle {
        width: 4; height: parent.height - 8
        anchors.left: parent.left; anchors.leftMargin: 4
        anchors.verticalCenter: parent.verticalCenter
        radius: 2
        color: root.notification ? typeColor(root.notification.type) : "#9e9e9e"
    }

    RowLayout {
        id: notifContent
        anchors.fill: parent
        anchors.leftMargin: 16; anchors.rightMargin: 12
        anchors.topMargin: 12; anchors.bottomMargin: 12
        spacing: 12

        CNotificationIconBadge {
            notificationType: root.notification ? root.notification.type : ""
        }

        CNotificationContent {
            Layout.fillWidth: true
            title: root.notification ? root.notification.title : ""
            message: root.notification ? root.notification.message : ""
            type: root.notification ? root.notification.type : ""
            timestamp: root.notification
                ? formatTimestamp(root.notification.timestamp) : ""
            isRead: root.isRead
        }

        ColumnLayout {
            Layout.alignment: Qt.AlignTop
            spacing: 4
            CButton {
                visible: !root.isRead; text: "Read"
                variant: "ghost"; size: "sm"
                onClicked: root.markRead()
            }
            CButton {
                text: "Dismiss"; variant: "ghost"; size: "sm"
                onClicked: root.dismiss()
            }
        }
    }

    CDivider {
        anchors.bottom: parent.bottom
        anchors.left: parent.left; anchors.right: parent.right
        anchors.leftMargin: 16; anchors.rightMargin: 16
    }

    MouseArea {
        anchors.fill: parent; z: -1
        onClicked: root.markRead()
        cursorShape: Qt.PointingHandCursor
    }
}

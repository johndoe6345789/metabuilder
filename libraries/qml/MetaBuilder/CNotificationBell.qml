import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

// Bell icon with red notification dot
Item {
    id: root
    Accessible.role: Accessible.Button
    Accessible.name: notificationCount > 0
        ? notificationCount + " notifications"
        : "No notifications"
    activeFocusOnTab: true

    property bool hasNotifications: true
    property int notificationCount: 0
    property bool isDark: Theme.mode === "dark"

    Keys.onReturnPressed: root.clicked()
    Keys.onSpacePressed: root.clicked()

    signal clicked()

    width: 32
    height: 32

    // ── MD3 palette ──
    readonly property color surfaceContainer: isDark
        ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)

    Rectangle {
        anchors.fill: parent
        radius: 16
        color: bellMA.containsMouse ? surfaceContainer : "transparent"

        CText {
            anchors.centerIn: parent
            text: "\uD83D\uDD14"
            font.pixelSize: 16
        }

        // Notification dot
        Rectangle {
            visible: root.hasNotifications
            anchors.top: parent.top
            anchors.right: parent.right
            anchors.topMargin: 2
            anchors.rightMargin: 4
            width: 8
            height: 8
            radius: 4
            color: "#F43F5E"
        }

        MouseArea {
            id: bellMA
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: root.clicked()
        }
    }
}

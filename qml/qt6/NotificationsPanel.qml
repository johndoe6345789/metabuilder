import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "NotificationsDBAL.js" as DBAL

Rectangle {
    id: root; color: "transparent"
    objectName: "view_notifications"
    Accessible.role: Accessible.Pane
    Accessible.name: "Notifications Panel"
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property string activeFilter: "All"
    property int unreadCount:
        DBAL.countUnread(notifications)
    property var filters:
        ["All", "System", "Alerts", "Info"]
    property var notifications:
        DBAL.defaultNotifications()

    function markAllRead() {
        notifications =
            DBAL.markAllRead(notifications)
        unreadCount = 0
    }
    function markReadById(id) {
        notifications = DBAL.markReadById(
            notifications, id)
        unreadCount =
            DBAL.countUnread(notifications)
    }
    function dismissNotification(id) {
        notifications =
            DBAL.dismissNotification(
                notifications, id)
        unreadCount =
            DBAL.countUnread(notifications)
    }
    function refresh() {
        DBAL.loadFromDBAL(dbal, function(n) {
            notifications = n
            unreadCount = DBAL.countUnread(n)
        })
    }

    Component.onCompleted:
        if (useLiveData) refresh()
    onUseLiveDataChanged:
        if (useLiveData) refresh()

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24; clip: true
        ColumnLayout {
            width: parent.width; spacing: 16
            CCard {
                Layout.fillWidth: true
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12
                        CText {
                            variant: "h3"
                            text: "Notifications"
                        }
                        CBadge {
                            visible: unreadCount > 0
                            text: unreadCount
                                + " unread"
                        }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Mark All Read"
                            variant: "ghost"; size: "sm"
                            enabled: unreadCount > 0
                            activeFocusOnTab: true
                            Accessible.role:
                                Accessible.Button
                            Accessible.name:
                                "Mark all read"
                            Keys.onReturnPressed:
                                markAllRead()
                            onClicked: markAllRead()
                        }
                        CButton {
                            text: dbal.loading
                                ? "Loading..."
                                : "Refresh"
                            variant: "ghost"; size: "sm"
                            enabled: !dbal.loading
                            activeFocusOnTab: true
                            Accessible.role:
                                Accessible.Button
                            Accessible.name:
                                dbal.loading
                                ? "Loading"
                                : "Refresh notifications"
                            Keys.onReturnPressed:
                                refresh()
                            onClicked: refresh()
                        }
                    }
                    CDivider { Layout.fillWidth: true }
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        Repeater {
                            model: filters
                            delegate: CButton {
                                text: modelData
                                variant: activeFilter
                                    === modelData
                                    ? "primary" : "ghost"
                                size: "sm"
                                activeFocusOnTab: true
                                Accessible.role:
                                    Accessible.Button
                                Accessible.name:
                                    "Filter: " + modelData
                                Keys.onReturnPressed:
                                    activeFilter = modelData
                                onClicked:
                                    activeFilter = modelData
                            }
                        }
                    }
                }
            }
            CCard {
                Layout.fillWidth: true
                visible:
                    DBAL.filterNotifications(
                        notifications,
                        activeFilter
                    ).length > 0
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16; spacing: 0
                    Repeater {
                        model:
                            DBAL.filterNotifications(
                                notifications,
                                activeFilter)
                        delegate: CNotificationItem {
                            notification: modelData
                            onMarkRead:
                                markReadById(modelData.id)
                            onDismiss:
                                dismissNotification(
                                    modelData.id)
                        }
                    }
                }
            }
            CNotificationEmptyState {
                visible:
                    DBAL.filterNotifications(
                        notifications,
                        activeFilter
                    ).length === 0
                filterLabel: activeFilter
            }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                visible: notifications.length > 0
                CText {
                    variant: "caption"; opacity: 0.5
                    text: notifications.length
                        + " total notifications"
                }
                CText {
                    variant: "caption"
                    text: " \u00b7 "; opacity: 0.3
                }
                CText {
                    variant: "caption"; opacity: 0.5
                    text: unreadCount + " unread"
                }
                Item { Layout.fillWidth: true }
                CText {
                    variant: "caption"; opacity: 0.4
                    text: useLiveData
                        ? "Live data" : "Mock data"
                }
            }
            Item { Layout.preferredHeight: 20 }
        }
    }
}

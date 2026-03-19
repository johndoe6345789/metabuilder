import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/DashboardDBAL.js" as DBAL

Rectangle {
    id: dashRoot
    color: Theme.background

    DBALProvider { id: dbal }

    property var healthData: ({})
    property bool dbalOnline: dbal.connected
    readonly property bool isDark: Theme.mode === "dark"
    property var cfg: ({})

    Component.onCompleted: {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", "../../frontends/qt6/config/dashboard-config.json")
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
                cfg = JSON.parse(xhr.responseText)
        }
        xhr.send()
        DBAL.refreshHealth(dbal, function(r) { healthData = r })
    }

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 24 }

            CWelcomeCard {
                Layout.fillWidth: true
                Layout.leftMargin: 24; Layout.rightMargin: 24
                username: appWindow.currentUser
                level: appWindow.currentLevel
                role: appWindow.currentRole
                isDark: dashRoot.isDark
                loading: dbal.loading
                onRefresh: DBAL.refreshHealth(dbal, function(r) { healthData = r })
            }

            Item { Layout.preferredHeight: 16 }

            FlexRow {
                Layout.fillWidth: true
                Layout.leftMargin: 24; Layout.rightMargin: 24
                spacing: 16

                Repeater {
                    model: {
                        var live = { label: "DBAL Status", value: dbalOnline ? "Healthy" : "Offline", status: dbalOnline ? "success" : "error" }
                        return [live].concat(cfg.staticStats || [])
                    }
                    delegate: CStatCard {
                        Layout.fillWidth: true
                        label: modelData.label; value: modelData.value
                        status: modelData.status; isDark: dashRoot.isDark
                    }
                }
            }

            Item { Layout.preferredHeight: 16 }

            CActivityList {
                Layout.fillWidth: true
                Layout.leftMargin: 24; Layout.rightMargin: 24
                isDark: dashRoot.isDark
                activities: cfg.activities || []
            }

            Item { Layout.preferredHeight: 16 }

            CQuickActions {
                Layout.fillWidth: true
                Layout.leftMargin: 24; Layout.rightMargin: 24
                isDark: dashRoot.isDark
                actions: cfg.quickActions || []
                onActionClicked: function(view) { appWindow.currentView = view }
            }

            Item { Layout.preferredHeight: 24 }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder" as Meta
import "ModeratorData.js" as Data

Rectangle {
    id: modView
    color: Theme.background
    objectName: "view_moderator"
    Accessible.role: Accessible.Pane
    Accessible.name: "Moderator View"

    readonly property bool isDark:
        Theme.mode === "dark"
    readonly property color accentCyan: "#06B6D4"
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant:
        Theme.textSecondary
    property int currentTab: 0
    property var reportQueue:
        Data.defaultReportQueue()
    property var recentActions:
        Data.defaultRecentActions()
    property var modStats: Data.buildStats(
        reportQueue, recentActions, accentCyan)

    ScrollView {
        anchors.fill: parent; clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width; spacing: 0

            Item { Layout.preferredHeight: 24 }

            Meta.CModeratorHeader {
                accentCyan: modView.accentCyan
                onSurface: modView.onSurface
                onSurfaceVariant:
                    modView.onSurfaceVariant
            }

            Item { Layout.preferredHeight: 24 }

            Meta.CModStatsRow {
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                stats: modView.modStats
                isDark: modView.isDark
            }

            Item { Layout.preferredHeight: 24 }

            CTabBar {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                currentIndex: currentTab
                activeFocusOnTab: true
                Accessible.role: Accessible.PageTabList
                Accessible.name: "Moderator tabs"
                Keys.onLeftPressed:
                    currentTab = Math.max(
                        0, currentTab - 1)
                Keys.onRightPressed:
                    currentTab = Math.min(
                        2, currentTab + 1)
                onCurrentIndexChanged:
                    currentTab = currentIndex
                tabs: [
                    { label: "Report Queue" },
                    { label: "Recent Actions" },
                    { label: "Settings" }
                ]
            }

            Item { Layout.preferredHeight: 16 }

            StackLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                currentIndex: currentTab

                ColumnLayout {
                    spacing: 8
                    Repeater {
                        model: reportQueue
                        delegate: Meta.CReportCard {
                            required property var modelData
                            report: modelData
                            isDark: modView.isDark
                        }
                    }
                    Item {
                        Layout.fillHeight: true
                    }
                }

                ColumnLayout {
                    spacing: 8
                    Repeater {
                        model: recentActions
                        delegate:
                            Meta.CModActionCard {
                            required property var modelData
                            action: modelData
                            isDark: modView.isDark
                        }
                    }
                    Item {
                        Layout.fillHeight: true
                    }
                }

                ColumnLayout {
                    spacing: 16
                    CText {
                        text: "Moderation Settings"
                        font.pixelSize: 18
                        font.weight: Font.Bold
                    }
                    CText {
                        text: "Auto-flag threshold,"
                            + " word filters, and"
                            + " notification"
                            + " preferences."
                        color: onSurfaceVariant
                    }
                    Item {
                        Layout.fillHeight: true
                    }
                }
            }
        }
    }
}

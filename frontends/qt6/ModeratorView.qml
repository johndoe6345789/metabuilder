import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: modView
    color: Theme.background

    readonly property bool isDark: Theme.mode === "dark"
    readonly property color accentCyan: "#06B6D4"
    readonly property color surfaceContainerHigh: isDark ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outlineVariant: isDark ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    property int currentTab: 0

    // Mock data
    property var reportQueue: [
        { id: 1, type: "spam",    user: "user42",  content: "Buy cheap watches...", reported: "2 min ago" },
        { id: 2, type: "abuse",   user: "troll99",  content: "Offensive language in forum post", reported: "15 min ago" },
        { id: 3, type: "off-topic", user: "newbie1", content: "Posted recipe in tech forum", reported: "1 hour ago" },
        { id: 4, type: "spam",    user: "bot_acct", content: "Click here for free...", reported: "3 hours ago" }
    ]

    property var recentActions: [
        { action: "Warned", target: "user88", reason: "Mild language", time: "10 min ago" },
        { action: "Muted", target: "spammer3", reason: "Spam (3rd offense)", time: "1 hour ago" },
        { action: "Approved", target: "post #412", reason: "False report", time: "2 hours ago" },
        { action: "Deleted", target: "comment #89", reason: "Hate speech", time: "5 hours ago" }
    ]

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 0

            Item { Layout.preferredHeight: 24 }

            // Header
            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 8

                RowLayout {
                    spacing: 12
                    CText {
                        text: "Moderator Tools"
                        font.pixelSize: 26
                        font.weight: Font.Bold
                        color: onSurface
                    }
                    Rectangle {
                        width: lvl.implicitWidth + 16
                        height: 24
                        radius: 12
                        color: Qt.rgba(accentCyan.r, accentCyan.g, accentCyan.b, 0.15)
                        CText {
                            id: lvl
                            anchors.centerIn: parent
                            text: "L3"
                            font.pixelSize: 11
                            font.weight: Font.Bold
                            font.family: "monospace"
                            color: accentCyan
                        }
                    }
                }

                CText {
                    text: "Manage reports, moderate content, and keep the community healthy."
                    color: onSurfaceVariant
                }
            }

            Item { Layout.preferredHeight: 24 }

            // Stats row
            RowLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                spacing: 12

                Repeater {
                    model: [
                        { label: "OPEN REPORTS", value: reportQueue.length.toString(), color: accentCyan },
                        { label: "ACTIONS TODAY", value: recentActions.length.toString(), color: "#6366F1" },
                        { label: "QUEUE TIME", value: "~5m", color: "#F59E0B" },
                        { label: "RESOLVED", value: "23", color: "#22C55E" }
                    ]
                    delegate: Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 72
                        radius: 12
                        color: surfaceContainerHigh
                        border.color: outlineVariant
                        border.width: 1

                        ColumnLayout {
                            anchors.centerIn: parent
                            spacing: 4
                            CText {
                                text: modelData.value
                                font.pixelSize: 22
                                font.weight: Font.Bold
                                font.family: "monospace"
                                color: modelData.color
                                Layout.alignment: Qt.AlignHCenter
                            }
                            CText {
                                text: modelData.label
                                font.pixelSize: 9
                                font.family: "monospace"
                                font.letterSpacing: 1.5
                                color: onSurfaceVariant
                                Layout.alignment: Qt.AlignHCenter
                            }
                        }
                    }
                }
            }

            Item { Layout.preferredHeight: 24 }

            // Tabs
            CTabBar {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                currentIndex: currentTab
                onCurrentIndexChanged: currentTab = currentIndex
                tabs: [{ label: "Report Queue" }, { label: "Recent Actions" }, { label: "Settings" }]
            }

            Item { Layout.preferredHeight: 16 }

            // Tab content
            StackLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                Layout.leftMargin: 24
                Layout.rightMargin: 24
                currentIndex: currentTab

                // Report Queue
                ColumnLayout {
                    spacing: 8

                    Repeater {
                        model: reportQueue
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 72
                            radius: 12
                            color: surfaceContainerHigh
                            border.color: outlineVariant
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 12

                                // Type badge
                                Rectangle {
                                    width: 4
                                    height: 36
                                    radius: 2
                                    color: modelData.type === "spam" ? "#F43F5E" :
                                           modelData.type === "abuse" ? "#EF4444" :
                                           "#F59E0B"
                                }

                                ColumnLayout {
                                    Layout.fillWidth: true
                                    spacing: 2
                                    CText {
                                        text: modelData.content
                                        font.pixelSize: 13
                                        elide: Text.ElideRight
                                        Layout.fillWidth: true
                                    }
                                    CText {
                                        text: modelData.type + " \u00B7 " + modelData.user + " \u00B7 " + modelData.reported
                                        font.pixelSize: 11
                                        color: onSurfaceVariant
                                    }
                                }

                                CButton {
                                    text: "Dismiss"
                                    variant: "ghost"
                                    size: "sm"
                                }
                                CButton {
                                    text: "Action"
                                    variant: "primary"
                                    size: "sm"
                                }
                            }
                        }
                    }
                    Item { Layout.fillHeight: true }
                }

                // Recent Actions
                ColumnLayout {
                    spacing: 8

                    Repeater {
                        model: recentActions
                        delegate: Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 56
                            radius: 12
                            color: surfaceContainerHigh
                            border.color: outlineVariant
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 16
                                spacing: 12

                                Rectangle {
                                    width: 4
                                    height: 28
                                    radius: 2
                                    color: modelData.action === "Deleted" ? "#F43F5E" :
                                           modelData.action === "Warned" ? "#F59E0B" :
                                           modelData.action === "Muted" ? "#EF4444" :
                                           "#22C55E"
                                }

                                CText {
                                    text: modelData.action
                                    font.pixelSize: 13
                                    font.weight: Font.DemiBold
                                }
                                CText {
                                    text: modelData.target
                                    font.pixelSize: 13
                                    font.family: "monospace"
                                    Layout.fillWidth: true
                                }
                                CText {
                                    text: modelData.time
                                    font.pixelSize: 11
                                    color: onSurfaceVariant
                                }
                            }
                        }
                    }
                    Item { Layout.fillHeight: true }
                }

                // Settings placeholder
                ColumnLayout {
                    spacing: 16

                    CText {
                        text: "Moderation Settings"
                        font.pixelSize: 18
                        font.weight: Font.Bold
                    }
                    CText {
                        text: "Auto-flag threshold, word filters, and notification preferences."
                        color: onSurfaceVariant
                    }
                    Item { Layout.fillHeight: true }
                }
            }
        }
    }
}

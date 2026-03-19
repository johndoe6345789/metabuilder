import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL connection ──
    DBALProvider { id: dbal }

    property bool dbalOnline: dbal.connected
    property string platformVersion: ""
    property var publicStats: ({ users: "---", packages: "---", workflows: "---" })

    // ── Mock fallback data ──
    property var mockStatusItems: [
        { label: "DBAL stack", value: "healthy" },
        { label: "Prisma migrations", value: "pending" },
        { label: "Daemon progress", value: "building" }
    ]

    function loadPlatformStatus() {
        dbal.ping(function(success) {
            if (success) {
                // Load version info
                dbal.execute("core/version", {}, function(result, error) {
                    if (result && result.version) {
                        platformVersion = result.version;
                    }
                });

                // Load public stats
                dbal.execute("core/stats", {}, function(result, error) {
                    if (result) {
                        publicStats = {
                            users: result.totalUsers || publicStats.users,
                            packages: result.totalPackages || publicStats.packages,
                            workflows: result.totalWorkflows || publicStats.workflows
                        };
                    }
                });

                // Load live status items
                dbal.execute("health", {}, function(result, error) {
                    if (result && result.services) {
                        var liveItems = [];
                        for (var i = 0; i < result.services.length; i++) {
                            var svc = result.services[i];
                            liveItems.push({ label: svc.name, value: svc.status });
                        }
                        if (liveItems.length > 0) {
                            statusItems = liveItems;
                        }
                    }
                });
            }
        });
    }

    Component.onCompleted: loadPlatformStatus()

    property int currentTab: 0

    property var featureHighlights: [
        { title: "Visual stacks", desc: "Compose landing, admin, and observability panels through drag-and-drop sections." },
        { title: "Observability built in", desc: "Monitor DBAL, Prisma, and daemon health from a single cockpit." },
        { title: "Config-first", desc: "Declarative seeds keep designers and developers aligned." }
    ]

    property var ciRuns: [
        { name: "frontends-nextjs-build", status: "passing" },
        { name: "dbal-unit-tests", status: "passing" },
        { name: "prisma-migrations", status: "running" }
    ]

    property var statusItems: mockStatusItems

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true

        ColumnLayout {
            width: parent.width - 24
            spacing: 28

            // Hero section
            CCard {
                Layout.fillWidth: true
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 32
                    spacing: 16

                    CText {
                        variant: "h1"
                        text: "MetaBuilder Observatory"
                    }
                    CText {
                        variant: "body1"
                        text: "A native Qt6 cockpit for the MetaBuilder platform. Monitor DBAL health, manage packages, and build declarative UIs."
                        wrapMode: Text.Wrap
                        Layout.fillWidth: true
                    }

                    FlexRow {
                        spacing: 12
                        CButton {
                            text: "Explore Levels"
                            variant: "primary"
                            onClicked: appWindow.currentView = "login"
                        }
                        CButton {
                            text: "View Storybook"
                            variant: "ghost"
                            onClicked: appWindow.currentView = "storybook"
                        }
                    }
                }
            }

            // Tab navigation
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 0

                CTabBar {
                    id: tabBar
                    Layout.fillWidth: true
                    currentIndex: currentTab
                    onCurrentIndexChanged: currentTab = currentIndex

                    tabs: [
                        { label: "Home" },
                        { label: "GitHub Actions" },
                        { label: "Status" }
                    ]
                }

                StackLayout {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 400
                    currentIndex: currentTab

                    // Home tab
                    Rectangle {
                        color: "transparent"
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.topMargin: 16
                            spacing: 20

                            CCard {
                                Layout.fillWidth: true
                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 20
                                    spacing: 12
                                    CText { variant: "h4"; text: "Why builders choose MetaBuilder" }
                                    FlexRow {
                                        Layout.fillWidth: true
                                        spacing: 16
                                        Repeater {
                                            model: featureHighlights
                                            delegate: CCard {
                                                Layout.fillWidth: true
                                                variant: "outlined"
                                                ColumnLayout {
                                                    anchors.fill: parent
                                                    anchors.margins: 14
                                                    spacing: 6
                                                    CText { variant: "subtitle1"; text: modelData.title }
                                                    CText { variant: "body2"; text: modelData.desc; wrapMode: Text.Wrap; Layout.fillWidth: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            CCard {
                                Layout.fillWidth: true
                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 20
                                    spacing: 10
                                    CText { variant: "h4"; text: "About MetaBuilder" }
                                    CText {
                                        variant: "body1"
                                        text: "MetaBuilder turns seed metadata, DBAL automation, and Prisma migrations into cohesive UX experiences without losing low-level control."
                                        wrapMode: Text.Wrap
                                        Layout.fillWidth: true
                                    }
                                }
                            }
                        }
                    }

                    // GitHub Actions tab
                    Rectangle {
                        color: "transparent"
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.topMargin: 16
                            spacing: 12
                            Repeater {
                                model: ciRuns
                                delegate: CCard {
                                    Layout.fillWidth: true
                                    FlexRow {
                                        anchors.fill: parent
                                        anchors.margins: 16
                                        spacing: 12
                                        CText { text: modelData.name; variant: "body1"; Layout.fillWidth: true }
                                        CStatusBadge {
                                            status: modelData.status === "passing" ? "success" : "warning"
                                            text: modelData.status
                                        }
                                    }
                                }
                            }
                            Item { Layout.fillHeight: true }
                        }
                    }

                    // Status tab
                    Rectangle {
                        color: "transparent"
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.topMargin: 16
                            spacing: 12
                            Repeater {
                                model: statusItems
                                delegate: CCard {
                                    Layout.fillWidth: true
                                    FlexRow {
                                        anchors.fill: parent
                                        anchors.margins: 16
                                        spacing: 12
                                        CText { text: modelData.label; variant: "body1"; Layout.fillWidth: true }
                                        CStatusBadge {
                                            status: modelData.value === "healthy" ? "success" : "warning"
                                            text: modelData.value
                                        }
                                    }
                                }
                            }
                            Item { Layout.fillHeight: true }
                        }
                    }
                }
            }

            // Footer
            FlexRow {
                Layout.fillWidth: true
                spacing: 20
                CText { variant: "caption"; text: "\u00a9 MetaBuilder \u2022 Public interface preview" }
                CText { variant: "caption"; text: "Built for data-driven builders" }
            }
        }
    }
}

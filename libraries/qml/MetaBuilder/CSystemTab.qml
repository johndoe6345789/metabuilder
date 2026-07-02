import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"
    property var daemons: []
    property var systemMetrics: ({
        cpu: 0, memory: 0, disk: 0, network: 0
    })
    signal reseedRequested()
    signal clearCacheRequested()
    signal restartRequested(string target)

    ScrollView {
        anchors.fill: parent; clip: true
        ColumnLayout {
            width: parent.width; spacing: 16

            CText { variant: "h3"; text: "System Overview" }
            CText { variant: "h4"; text: "Daemon Status" }
            GridLayout {
                Layout.fillWidth: true
                columns: 2
                columnSpacing: 16; rowSpacing: 16
                Repeater {
                    model: root.daemons
                    delegate: CCard {
                        Layout.fillWidth: true
                        FlexRow {
                            Layout.fillWidth: true; spacing: 10
                            CText {
                                variant: "subtitle1"
                                text: modelData.name
                            }
                            CStatusBadge {
                                status: modelData.status
                                    === "healthy"
                                    ? "success" : "warning"
                                text: modelData.status
                            }
                            Item { Layout.fillWidth: true }
                            CBadge {
                                text: ":" + modelData.port
                                badgeColor: Theme.info
                            }
                        }
                        CText {
                            variant: "caption"
                            text: "Uptime: "
                                + modelData.uptime
                            color: Theme.textSecondary
                        }
                    }
                }
            }
            CDivider { Layout.fillWidth: true }
            CText { variant: "h4"; text: "System Metrics" }
            GridLayout {
                Layout.fillWidth: true
                columns: 4
                columnSpacing: 16; rowSpacing: 16
                Repeater {
                    model: [
                        { label: "CPU", value: root.systemMetrics.cpu },
                        { label: "Memory",
                          value: root.systemMetrics.memory },
                        { label: "Disk",
                          value: root.systemMetrics.disk },
                        { label: "Network",
                          value: root.systemMetrics.network }
                    ]
                    delegate: CSystemMetricCard {
                        required property var modelData
                        label: modelData.label
                        value: modelData.value
                    }
                }
            }
            CDivider { Layout.fillWidth: true }
            CText { variant: "h4"; text: "System Actions" }
            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CButton {
                    text: "Force Re-seed"
                    variant: "primary"; size: "sm"
                    onClicked: root.reseedRequested()
                }
                CButton {
                    text: "Clear Cache"
                    variant: "ghost"; size: "sm"
                    onClicked: root.clearCacheRequested()
                }
                CButton {
                    text: "Restart DBAL"
                    variant: "danger"; size: "sm"
                    onClicked: {
                        root.restartRequested("DBAL")
                    }
                }
                CButton {
                    text: "Restart Redis"
                    variant: "danger"; size: "sm"
                    onClicked: {
                        root.restartRequested("Redis")
                    }
                }
            }
            CDivider { Layout.fillWidth: true }
            CText { variant: "h4"; text: "Environment" }
            CCard {
                Layout.fillWidth: true
                RowLayout {
                    Layout.fillWidth: true; spacing: 24
                    ColumnLayout {
                        spacing: 4
                        CText {
                            variant: "caption"
                            text: "Version"
                            color: Theme.textSecondary
                        }
                        CText {
                            variant: "body1"
                            text: "2.5.0-rc1"
                        }
                    }
                    ColumnLayout {
                        spacing: 4
                        CText {
                            variant: "caption"
                            text: "Build Date"
                            color: Theme.textSecondary
                        }
                        CText {
                            variant: "body1"
                            text: "2026-03-15"
                        }
                    }
                    ColumnLayout {
                        spacing: 4
                        CText {
                            variant: "caption"
                            text: "Node Count"
                            color: Theme.textSecondary
                        }
                        CText {
                            variant: "body1"
                            text: "4 nodes"
                        }
                    }
                    ColumnLayout {
                        spacing: 4
                        CText {
                            variant: "caption"
                            text: "Platform"
                            color: Theme.textSecondary
                        }
                        CText {
                            variant: "body1"
                            text: "MetaBuilder Universal"
                        }
                    }
                }
            }
        }
    }
}

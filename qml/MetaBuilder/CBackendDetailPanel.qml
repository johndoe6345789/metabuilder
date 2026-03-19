import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true
    Layout.fillHeight: true

    property var backend: ({ name: "", key: "", status: "disconnected", description: "", connectionString: "", records: 0, sizeKb: 0, lastBackup: "Never" })
    property bool isActive: false
    property int testingIndex: -1
    property int backendIndex: -1
    property var testResult: undefined

    signal testConnectionRequested()
    signal setActiveRequested()

    function formatSize(kb) {
        if (kb < 1024) return kb + " KB"
        return (kb / 1024).toFixed(1) + " MB"
    }

    Flickable {
        anchors.fill: parent
        anchors.margins: 16
        contentHeight: detailColumn.implicitHeight
        clip: true

        ColumnLayout {
            id: detailColumn
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h4"; text: root.backend.name }
                CStatusBadge {
                    status: root.backend.status === "connected" ? "success" : (root.backend.status === "error" ? "error" : "warning")
                    text: root.backend.status
                }

                Item { Layout.fillWidth: true }

                CBadge {
                    text: root.isActive ? "ACTIVE" : "INACTIVE"
                    accent: root.isActive
                }
            }

            CText {
                variant: "body1"
                text: root.backend.description
                wrapMode: Text.Wrap
                Layout.fillWidth: true
            }

            CDivider { Layout.fillWidth: true }

            CText { variant: "subtitle1"; text: "Connection" }

            CTextField {
                label: "Connection String"
                text: root.backend.connectionString
                Layout.fillWidth: true
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                CButton {
                    text: root.testingIndex === root.backendIndex ? "Testing..." : "Test Connection"
                    variant: "primary"
                    enabled: root.testingIndex === -1
                    onClicked: root.testConnectionRequested()
                }

                CButton {
                    text: root.isActive ? "Active Backend" : "Set as Active"
                    variant: root.isActive ? "ghost" : "primary"
                    enabled: !root.isActive && root.backend.status === "connected"
                    onClicked: root.setActiveRequested()
                }

                Item { Layout.fillWidth: true }

                Loader {
                    active: root.testResult !== undefined
                    sourceComponent: CStatusBadge {
                        status: root.testResult === "success" ? "success" : "error"
                        text: root.testResult === "success" ? "Connection OK" : "Connection Failed"
                    }
                }
            }

            CDivider { Layout.fillWidth: true }

            CText { variant: "subtitle1"; text: "Storage Statistics" }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CPaper {
                    Layout.fillWidth: true
                    implicitHeight: 60

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 2
                        CText { variant: "caption"; text: "Records" }
                        CText { variant: "h4"; text: root.backend.records.toLocaleString() }
                    }
                }

                CPaper {
                    Layout.fillWidth: true
                    implicitHeight: 60

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 2
                        CText { variant: "caption"; text: "Size" }
                        CText { variant: "h4"; text: root.formatSize(root.backend.sizeKb) }
                    }
                }

                CPaper {
                    Layout.fillWidth: true
                    implicitHeight: 60

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 2
                        CText { variant: "caption"; text: "Last Backup" }
                        CText { variant: "body2"; text: root.backend.lastBackup }
                    }
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "panel_backend_detail"
    Accessible.role: Accessible.Pane
    Accessible.name: backend.name || "Backend"
    Layout.fillWidth: true
    Layout.fillHeight: true

    property var backend: ({
        name: "", key: "",
        status: "disconnected",
        description: "",
        connectionString: "",
        records: 0, sizeKb: 0,
        lastBackup: "Never"
    })
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
        Layout.fillWidth: true
        height: root.height - 32
        contentHeight:
            detailColumn.implicitHeight
        clip: true

        ColumnLayout {
            id: detailColumn
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText {
                    variant: "h4"
                    text: root.backend.name
                }
                CStatusBadge {
                    status: root.backend.status
                        === "connected"
                        ? "success"
                        : (root.backend.status
                            === "error"
                            ? "error" : "warning")
                    text: root.backend.status
                }
                Item { Layout.fillWidth: true }
                CBadge {
                    text: root.isActive
                        ? "ACTIVE" : "INACTIVE"
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

            CBackendConnectionSection {
                Layout.fillWidth: true
                connectionString:
                    root.backend.connectionString
                isActive: root.isActive
                isTesting: root.testingIndex
                    === root.backendIndex
                isConnected:
                    root.backend.status
                    === "connected"
                testResult: root.testResult
                onTestConnectionRequested:
                    root.testConnectionRequested()
                onSetActiveRequested:
                    root.setActiveRequested()
            }

            CDivider { Layout.fillWidth: true }

            CText {
                variant: "subtitle1"
                text: "Storage Statistics"
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CStatCell {
                    label: "Records"
                    value: root.backend
                        .records.toLocaleString()
                }
                CStatCell {
                    label: "Size"
                    value: root.formatSize(
                        root.backend.sizeKb)
                }
                CStatCell {
                    label: "Last Backup"
                    value: root.backend.lastBackup
                    valueVariant: "body2"
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "mediaHeader"
    Accessible.role: Accessible.Pane
    Accessible.name: "Media service header"
    Layout.fillWidth: true

    property string serviceStatus: "unknown"
    property string serviceVersion: ""
    property string lastHealthCheck: ""
    property int jobCount: 0
    property int radioCount: 0
    property int tvCount: 0
    property int pluginCount: 0

    signal refreshClicked()

    ColumnLayout {
        Layout.fillWidth: true; spacing: 12

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h2"; text: "Media Service" }
            CBadge { text: "God Panel" }
            CStatusBadge {
                status: root.serviceStatus === "online"
                    ? "success"
                    : root.serviceStatus === "offline"
                        ? "error" : "warning"
                text: root.serviceStatus === "online"
                    ? "Online"
                    : root.serviceStatus === "offline"
                        ? "Offline" : "Checking..."
            }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Refresh"
                variant: "ghost"; size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Refresh media service"
                Keys.onReturnPressed: root.refreshClicked()
                Keys.onSpacePressed: root.refreshClicked()
                onClicked: root.refreshClicked()
            }
        }
        CDivider { Layout.fillWidth: true }
        FlexRow {
            Layout.fillWidth: true; spacing: 8
            CChip {
                text: root.jobCount + " Jobs"
                Accessible.role: Accessible.StaticText
                Accessible.name: root.jobCount + " Jobs"
            }
            CChip {
                text: root.radioCount + " Radio Channels"
                Accessible.role: Accessible.StaticText
                Accessible.name: root.radioCount
                    + " Radio Channels"
            }
            CChip {
                text: root.tvCount + " TV Channels"
                Accessible.role: Accessible.StaticText
                Accessible.name: root.tvCount
                    + " TV Channels"
            }
            CChip {
                text: root.pluginCount + " Plugins"
                Accessible.role: Accessible.StaticText
                Accessible.name: root.pluginCount
                    + " Plugins"
            }
            Item { Layout.fillWidth: true }
            CText {
                visible: root.lastHealthCheck.length > 0
                variant: "caption"
                text: "Last check: "
                    + root.lastHealthCheck
                color: Theme.textSecondary
            }
            CText {
                visible: root.serviceVersion.length > 0
                variant: "caption"
                text: "v" + root.serviceVersion
                color: Theme.textSecondary
            }
        }
    }
}

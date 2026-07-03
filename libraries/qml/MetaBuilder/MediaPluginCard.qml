import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property string name: ""
    property string version: ""
    property string status: ""
    property var capabilities: []

    signal reloadRequested()

    Layout.fillWidth: true
    variant: "outlined"

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 10

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText { variant: "subtitle1"; text: root.name }

            Item { Layout.fillWidth: true }

            CStatusBadge {
                status: root.status === "active" ? "success" : "warning"
                text: root.status
            }
        }

        CText {
            variant: "caption"
            text: "v" + root.version
            color: Theme.textSecondary
        }

        CDivider { Layout.fillWidth: true }

        CText { variant: "caption"; text: "Capabilities" }

        Flow {
            Layout.fillWidth: true
            spacing: 6

            Repeater {
                model: root.capabilities

                delegate: CChip {
                    text: modelData
                }
            }
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            Item { Layout.fillWidth: true }

            CButton {
                text: "Reload"
                variant: "ghost"
                size: "sm"
                onClicked: root.reloadRequested()
            }
        }
    }
}

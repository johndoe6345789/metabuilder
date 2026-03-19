import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    Layout.fillWidth: true
    spacing: 4

    property var job: ({})
    property bool isLast: false

    signal cancelRequested()

    function jobStatusColor(status) {
        switch (status) {
            case "completed":  return "success"
            case "processing": return "warning"
            case "queued":     return "info"
            case "failed":     return "error"
            default:           return "info"
        }
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        CText {
            variant: "body2"; text: root.job.id || ""
            font.family: "monospace"; Layout.preferredWidth: 100
        }

        CBadge { text: root.job.type || ""; Layout.preferredWidth: 80 }

        CStatusBadge {
            status: jobStatusColor(root.job.status || "")
            text: root.job.status || ""; Layout.preferredWidth: 100
        }

        CJobProgressBar {
            progress: root.job.progress || 0
            status: root.job.status || ""
        }

        CText {
            variant: "caption"; text: root.job.created || ""
            Layout.preferredWidth: 160; color: Theme.textSecondary
        }

        CButton {
            text: "Cancel"; variant: "danger"; size: "sm"
            enabled: root.job.status === "queued" ||
                root.job.status === "processing"
            visible: root.job.status !== "completed" &&
                root.job.status !== "failed"
            Layout.preferredWidth: 70
            onClicked: root.cancelRequested()
        }

        Item {
            visible: root.job.status === "completed" ||
                root.job.status === "failed"
            Layout.preferredWidth: 70
        }
    }

    CDivider { Layout.fillWidth: true; visible: !root.isLast }
}

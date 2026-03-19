import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: jobTable
    Layout.fillWidth: true

    property var jobs: []

    signal cancelRequested(string jobId)

    function jobStatusColor(status) {
        switch (status) {
            case "completed":  return "success"
            case "processing": return "warning"
            case "queued":     return "info"
            case "failed":     return "error"
            default:           return "info"
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "h4"; text: "Active Jobs" }
            CText { variant: "caption"; text: jobs.length + " total"; color: Theme.textSecondary }
        }

        CDivider { Layout.fillWidth: true }

        // Table header
        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText { variant: "caption"; text: "ID";       Layout.preferredWidth: 100 }
            CText { variant: "caption"; text: "Type";     Layout.preferredWidth: 80 }
            CText { variant: "caption"; text: "Status";   Layout.preferredWidth: 100 }
            CText { variant: "caption"; text: "Progress"; Layout.fillWidth: true }
            CText { variant: "caption"; text: "Created";  Layout.preferredWidth: 160 }
            CText { variant: "caption"; text: "";          Layout.preferredWidth: 70 }
        }

        CDivider { Layout.fillWidth: true }

        // Job rows
        Repeater {
            model: jobs

            delegate: ColumnLayout {
                Layout.fillWidth: true
                spacing: 4

                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CText {
                        variant: "body2"
                        text: modelData.id
                        font.family: "monospace"
                        Layout.preferredWidth: 100
                    }

                    CBadge {
                        text: modelData.type
                        Layout.preferredWidth: 80
                    }

                    CStatusBadge {
                        status: jobStatusColor(modelData.status)
                        text: modelData.status
                        Layout.preferredWidth: 100
                    }

                    // Progress bar area
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 20
                        color: "transparent"

                        Rectangle {
                            anchors.verticalCenter: parent.verticalCenter
                            width: parent.width
                            height: 6
                            radius: 3
                            color: Theme.border

                            Rectangle {
                                width: parent.width * (modelData.progress / 100)
                                height: parent.height
                                radius: 3
                                color: modelData.status === "failed" ? Theme.error
                                     : modelData.status === "completed" ? Theme.success
                                     : Theme.primary
                            }
                        }

                        CText {
                            anchors.right: parent.right
                            anchors.verticalCenter: parent.verticalCenter
                            variant: "caption"
                            text: modelData.progress + "%"
                        }
                    }

                    CText {
                        variant: "caption"
                        text: modelData.created
                        Layout.preferredWidth: 160
                        color: Theme.textSecondary
                    }

                    CButton {
                        text: "Cancel"
                        variant: "danger"
                        size: "sm"
                        enabled: modelData.status === "queued" || modelData.status === "processing"
                        visible: modelData.status !== "completed" && modelData.status !== "failed"
                        Layout.preferredWidth: 70
                        onClicked: cancelRequested(modelData.id)
                    }

                    // Placeholder for completed/failed jobs
                    Item {
                        visible: modelData.status === "completed" || modelData.status === "failed"
                        Layout.preferredWidth: 70
                    }
                }

                CDivider {
                    Layout.fillWidth: true
                    visible: index < jobs.length - 1
                }
            }
        }
    }
}

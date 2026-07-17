import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: jobTable
    Layout.fillWidth: true

    property var jobs: []

    signal cancelRequested(string jobId)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "h4"; text: "Active Jobs" }
            CText {
                variant: "caption"
                text: jobs.length + " total"
                color: Theme.textSecondary
            }
        }

        CDivider { Layout.fillWidth: true }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CText {
                variant: "caption"; text: "ID"
                Layout.preferredWidth: 100
            }
            CText {
                variant: "caption"; text: "Type"
                Layout.preferredWidth: 80
            }
            CText {
                variant: "caption"; text: "Status"
                Layout.preferredWidth: 100
            }
            CText {
                variant: "caption"; text: "Progress"
                Layout.fillWidth: true
            }
            CText {
                variant: "caption"; text: "Created"
                Layout.preferredWidth: 160
            }
            CText {
                variant: "caption"; text: ""
                Layout.preferredWidth: 70
            }
        }

        CDivider { Layout.fillWidth: true }

        Repeater {
            model: jobs

            delegate: MediaJobRow {
                Layout.fillWidth: true
                job: modelData
                isLast: index >= jobs.length - 1
                onCancelRequested: {
                    jobTable.cancelRequested(
                        modelData.id)
                }
            }
        }
    }
}

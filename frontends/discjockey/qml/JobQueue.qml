import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "#0f1117"

    required property var model

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 6

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: "Jobs"
                font.bold: true; font.pixelSize: 13
                color: "#e6edf3"
            }
            Item { Layout.fillWidth: true }
            Label {
                text: jobList.count > 0
                    ? jobList.count + " job"
                        + (jobList.count !== 1 ? "s" : "")
                    : ""
                color: "#8b949e"; font.pixelSize: 11
            }
        }

        Rectangle {
            Layout.fillWidth: true; height: 1; color: "#30363d"
        }

        Item {
            Layout.fillWidth: true; Layout.fillHeight: true

            ListView {
                id: jobList
                anchors.fill: parent
                model: root.model
                clip: true; spacing: 4

                delegate: JobItem {
                    width: jobList.width
                    jobFile:     model.jobFile
                    jobType:     model.jobType
                    jobStatus:   model.jobStatus
                    jobProgress: model.jobProgress
                }
            }

            Label {
                visible: jobList.count === 0
                anchors.centerIn: parent
                text: "No jobs yet"
                color: "#484f58"; font.pixelSize: 12
            }
        }
    }
}

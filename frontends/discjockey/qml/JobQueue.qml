import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    color: "#0f1117"

    required property var model

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 8
        spacing: 4

        RowLayout {
            Layout.fillWidth: true
            Label {
                text: "Job Queue"
                font.bold: true
                font.pixelSize: 13
                color: "#e6edf3"
            }
            Item { Layout.fillWidth: true }
            Label {
                text: root.model
                    ? root.model.rowCount
                        + " jobs"
                    : ""
                color: "#8b949e"
                font.pixelSize: 11
            }
        }

        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#30363d"
        }

        ListView {
            id: jobList
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.model
            clip: true
            spacing: 4

            delegate: JobItem {
                width: jobList.width
                jobFile:     model.jobFile
                jobType:     model.jobType
                jobStatus:   model.jobStatus
                jobProgress: model.jobProgress
            }
        }
    }
}

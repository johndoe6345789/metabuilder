import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "progressbar_job"
    Accessible.role: Accessible.ProgressBar
    Accessible.name: "Job progress: " + root.progress + "%"
    Accessible.description: root.status !== ""
        ? "Status: " + root.status
        : "Job is in progress"
    Layout.fillWidth: true
    Layout.preferredHeight: 20
    color: "transparent"

    property int progress: 0
    property string status: ""

    Rectangle {
        anchors.verticalCenter: parent.verticalCenter
        width: parent.width; height: 6; radius: 3
        color: Theme.border

        Rectangle {
            width: parent.width * (root.progress / 100)
            height: parent.height; radius: 3
            color: root.status === "failed" ? Theme.error
                 : root.status === "completed" ? Theme.success
                 : Theme.primary
        }
    }

    CText {
        anchors.right: parent.right
        anchors.verticalCenter: parent.verticalCenter
        variant: "caption"; text: root.progress + "%"
    }
}

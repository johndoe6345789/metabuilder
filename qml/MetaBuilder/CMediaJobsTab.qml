import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "mediaJobsTab"
    Accessible.role: Accessible.Pane
    Accessible.name: "Media jobs"
    color: "transparent"

    property var jobs: []

    signal jobSubmitted(string type, string input, string output,
        string priority)
    signal cancelRequested(string jobId)

    ScrollView {
        anchors.fill: parent; clip: true
        ColumnLayout {
            width: parent.width; spacing: 16

            MediaJobForm {
                id: jobForm
                onSubmitRequested: {
                    root.jobSubmitted(jobForm.jobTypes[jobForm.jobTypeIndex],
                        jobForm.jobInputPath, jobForm.jobOutputPath,
                        jobForm.jobPriorities[jobForm.jobPriorityIndex])
                    jobForm.jobInputPath = ""
                    jobForm.jobOutputPath = ""
                }
            }

            MediaJobTable { jobs: root.jobs
            onCancelRequested: function(jobId) { root.cancelRequested(jobId) } }
            Item { Layout.preferredHeight: 8 }
        }
    }
}

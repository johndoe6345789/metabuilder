import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: jobForm
    Layout.fillWidth: true

    property int jobTypeIndex: 0
    property var jobTypes: ["video", "audio", "document", "image"]
    property string jobInputPath: ""
    property string jobOutputPath: ""
    property int jobPriorityIndex: 2
    property var jobPriorities: ["urgent", "high", "normal", "low"]

    signal submitRequested()

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        CText { variant: "h4"; text: "Submit Job" }
        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            // Type selector
            ColumnLayout {
                Layout.preferredWidth: 200
                spacing: 4

                CText { variant: "caption"; text: "Type" }

                RowLayout {
                    spacing: 4

                    Repeater {
                        model: jobTypes
                        delegate: CButton {
                            text: modelData
                            variant: jobTypeIndex === index
                                ? "primary" : "ghost"
                            size: "sm"
                            onClicked: jobTypeIndex = index
                        }
                    }
                }
            }

            CTextField {
                Layout.fillWidth: true
                label: "Input Path"
                placeholderText: "/media/input/video.mp4"
                text: jobInputPath
                onTextChanged: jobInputPath = text
            }

            CTextField {
                Layout.fillWidth: true
                label: "Output Path"
                placeholderText: "/media/output/video.webm"
                text: jobOutputPath
                onTextChanged: jobOutputPath = text
            }
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            // Priority selector
            CText { variant: "caption"; text: "Priority:" }

            Repeater {
                model: jobPriorities
                delegate: CButton {
                    text: modelData
                    variant: jobPriorityIndex === index ? "primary" : "ghost"
                    size: "sm"
                    onClicked: jobPriorityIndex = index
                }
            }

            Item { Layout.fillWidth: true }

            CButton {
                text: "Submit Job"
                variant: "primary"
                enabled: jobInputPath.length > 0 && jobOutputPath.length > 0
                onClicked: submitRequested()
            }
        }
    }
}

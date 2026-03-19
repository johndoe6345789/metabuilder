import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    Layout.fillWidth: true
    spacing: 8

    property var schedule: []

    CText { variant: "subtitle1"; text: "Schedule" }
    CText {
        variant: "caption"
        text: schedule.length + " programs"
        color: Theme.textSecondary
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        CText { variant: "caption"; text: "Time"; Layout.preferredWidth: 80 }
        CText { variant: "caption"; text: "Program";  Layout.fillWidth: true }
        CText { variant: "caption"; text: "Duration"
        Layout.preferredWidth: 80 }
    }

    CDivider { Layout.fillWidth: true }

    Repeater {
        model: root.schedule

        delegate: ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                CText {
                    variant: "body2"; text: modelData.time
                    font.family: "monospace"; font.bold: true
                    Layout.preferredWidth: 80
                }
                CText {
                    variant: "body2"; text: modelData.program
                    Layout.fillWidth: true
                }
                CText {
                    variant: "caption"; text: modelData.duration
                    color: Theme.textSecondary
                    Layout.preferredWidth: 80
                }
            }

            CDivider {
                Layout.fillWidth: true
                visible: index < root.schedule.length - 1
            }
        }
    }
}

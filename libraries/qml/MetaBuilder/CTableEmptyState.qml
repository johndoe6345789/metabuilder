import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Item {
    id: root
    Layout.fillWidth: true

    property string title: "No records found"
    property string subtitle: "Try adjusting your search or filter criteria."

    Layout.preferredHeight: 120

    ColumnLayout {
        anchors.centerIn: parent
        spacing: 8

        CText {
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
            variant: "h4"
            text: root.title
            color: Theme.textSecondary
        }
        CText {
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
            variant: "caption"
            text: root.subtitle
            color: Theme.textMuted
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true

    property string filterLabel: "All"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 40
        spacing: 16
        Layout.alignment: Qt.AlignHCenter

        CText {
            Layout.alignment: Qt.AlignHCenter
            variant: "h2"
            text: "\u{1F514}"
        }

        CText {
            Layout.alignment: Qt.AlignHCenter
            variant: "h4"
            text: filterLabel === "All"
                ? "No notifications"
                : "No " + filterLabel.toLowerCase() + " notifications"
        }

        CText {
            Layout.alignment: Qt.AlignHCenter
            variant: "body2"
            text: "When there are new notifications, they will appear here."
            opacity: 0.6
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: listItem
    variant: "outlined"

    property var packageData: ({})
    signal detailsRequested()
    signal installRequested()
    signal uninstallRequested()

    FlexRow {
        Layout.fillWidth: true
        spacing: 16

        // Package icon badge
        Rectangle {
            width: 40
            height: 40
            radius: 8
            color: packageData.installed ? Theme.primary : Theme.border
            Layout.alignment: Qt.AlignVCenter

            CText {
                anchors.centerIn: parent
                text: packageData.icon
                    ? packageData.icon
                    : (packageData.name ? packageData.name.charAt(0) : "?")
                variant: "subtitle1"
                color: packageData.installed ? "#ffffff" : Theme.text
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "subtitle1"; text: packageData.name || "" }
            CText { variant: "body2"; text: packageData.description || ""
            wrapMode: Text.Wrap }
            FlexRow {
                spacing: 8
                CBadge { text: "v" + (packageData.version || "0.0.0") }
                CBadge {
                    text: packageData.category ? packageData.category : "—"
                    visible: packageData.category !== undefined
                }
                CBadge {
                    text: "Level " + (packageData.level ? packageData.level : 2)
                }
            }
        }

        ColumnLayout {
            spacing: 6
            CButton {
                text: packageData.installed ? "Installed" : "Install"
                variant: packageData.installed ? "default" : "primary"
                enabled: !packageData.installed
                size: "sm"
                onClicked: installRequested()
            }
            CButton {
                text: "Uninstall"
                variant: "danger"
                size: "sm"
                enabled: packageData.installed
                onClicked: uninstallRequested()
            }
            CButton {
                text: "Details"
                variant: "ghost"
                size: "sm"
                onClicked: detailsRequested()
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.preferredWidth: 300
    Layout.fillHeight: true

    property var backends: []
    property int selectedIndex: 0

    signal backendSelected(int index)

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 8

        CText { variant: "subtitle1"; text: "Backends (" + backends.length + ")" }
        CDivider { Layout.fillWidth: true }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.backends
            spacing: 4
            clip: true

            delegate: CListItem {
                width: parent ? parent.width : 268
                title: modelData.name
                subtitle: modelData.key
                selected: index === root.selectedIndex
                leadingIcon: modelData.status === "connected" ? "check_circle" : (modelData.status === "error" ? "error" : "radio_button_unchecked")

                onClicked: root.backendSelected(index)

                CStatusBadge {
                    anchors.right: parent.right
                    anchors.rightMargin: 12
                    anchors.verticalCenter: parent.verticalCenter
                    status: modelData.status === "connected" ? "success" : (modelData.status === "error" ? "error" : "warning")
                    text: modelData.status
                }
            }
        }
    }
}

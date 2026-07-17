import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "sidebar_backend_list"
    Accessible.role: Accessible.List
    Accessible.name: "Backend List"
    Layout.preferredWidth: 300
    Layout.fillHeight: true

    property var backends: []
    property int selectedIndex: 0

    signal backendSelected(int index)

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 8

        CText { variant: "subtitle1"
        text: "Backends (" + backends.length + ")" }
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
                leadingIcon: modelData.status === "connected"
                    ? "check_circle"
                    : (modelData.status === "error"
                        ? "error" : "radio_button_unchecked")
                activeFocusOnTab: true
                Accessible.role: Accessible.ListItem
                Accessible.name: modelData.name
                Accessible.description:
                    modelData.key + " — " + modelData.status
                Keys.onReturnPressed: root.backendSelected(index)
                Keys.onSpacePressed: root.backendSelected(index)
                onClicked: root.backendSelected(index)

                CStatusBadge {
                    anchors.right: parent.right
                    anchors.rightMargin: 12
                    anchors.verticalCenter: parent.verticalCenter
                    status: modelData.status === "connected"
                        ? "success"
                        : (modelData.status === "error" ? "error" : "warning")
                    text: modelData.status
                }
            }
        }
    }
}

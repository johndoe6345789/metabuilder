import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "dropdownSidebar"
    Accessible.role: Accessible.Pane
    Accessible.name: "Dropdown sidebar"

    property var dropdowns: []
    property int selectedIndex: -1
    signal itemClicked(int index)
    signal addClicked()

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 16
        spacing: 12

        FlexRow {
            Layout.fillWidth: true
            spacing: 8
            CText { variant: "h4"; text: "Dropdowns" }
            Item { Layout.fillWidth: true }
            CButton {
                text: "+ Add"
                variant: "primary"
                size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Add dropdown"
                Keys.onReturnPressed: root.addClicked()
                Keys.onSpacePressed: root.addClicked()
                onClicked: root.addClicked()
            }
        }

        CDivider { Layout.fillWidth: true }

        ListView {
            id: dropdownList
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.dropdowns
            spacing: 4
            clip: true

            delegate: CListItem {
                width: dropdownList.width
                title: modelData.name
                subtitle: modelData.description
                selected: index === root.selectedIndex
                activeFocusOnTab: true
                Accessible.role: Accessible.ListItem
                Accessible.name: modelData.name
                Accessible.description: modelData.description
                    + ", " + modelData.options.length
                    + " options"
                Keys.onReturnPressed: root.itemClicked(index)
                Keys.onSpacePressed: root.itemClicked(index)
                onClicked: root.itemClicked(index)

                CBadge {
                    anchors.right: parent.right
                    anchors.rightMargin: 12
                    anchors.verticalCenter: parent.verticalCenter
                    text: modelData.options.length + ""
                }
            }
        }
    }
}

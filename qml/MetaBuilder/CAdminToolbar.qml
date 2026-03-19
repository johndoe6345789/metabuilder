import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    spacing: 12

    property string selectedEntity: ""
    property string searchText: ""
    property string activeFilter: "All"
    property var entityIcons: ({})
    property bool useLiveData: false
    property bool hasSelectedRows: false

    signal searchChanged(string text)
    signal filterChanged(string filter)
    signal createClicked()
    signal deleteSelectedClicked()

    FlexRow {
        Layout.fillWidth: true; spacing: 12
        CText { variant: "h3"; text: (root.entityIcons[root.selectedEntity] || "") + "  " + root.selectedEntity + " Management" }
        CStatusBadge { status: root.useLiveData ? "success" : "warning"; text: root.useLiveData ? "Live" : "Mock" }
        Item { Layout.fillWidth: true }
        CButton { text: "Create Record"; variant: "primary"; size: "sm"; onClicked: root.createClicked() }
    }

    FlexRow {
        Layout.fillWidth: true; spacing: 8
        CTextField {
            Layout.preferredWidth: 280; label: "Search"
            placeholderText: "Filter " + root.selectedEntity.toLowerCase() + " records..."
            text: root.searchText; onTextChanged: root.searchChanged(text)
        }
        Item { Layout.preferredWidth: 12 }
        Repeater {
            model: ["All", "Active", "Inactive"]
            delegate: CChip {
                text: modelData; checked: root.activeFilter === modelData
                chipColor: root.activeFilter === modelData ? Theme.primary : Theme.surface
                onClicked: root.filterChanged(modelData)
            }
        }
        Item { Layout.fillWidth: true }
        CButton { text: "Delete Selected"; variant: "danger"; size: "sm"; enabled: root.hasSelectedRows; onClicked: root.deleteSelectedClicked() }
    }
}

import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "toolbar_admin"
    Accessible.role: Accessible.ToolBar
    Accessible.name: "Admin Toolbar"
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
        Layout.fillWidth: true
        spacing: 12
        CText {
            variant: "h3"
            text: (root.entityIcons[
                root.selectedEntity] || "")
                + "  " + root.selectedEntity
                + " Management"
        }
        CStatusBadge {
            status: root.useLiveData
                ? "success" : "warning"
            text: root.useLiveData
                ? "Live" : "Mock"
        }
        Item { Layout.fillWidth: true }
        CButton {
            text: "Create Record"
            variant: "primary"
            size: "sm"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Create Record"
            Accessible.description:
                "Create a new "
                + root.selectedEntity
                + " record"
            Keys.onReturnPressed:
                root.createClicked()
            Keys.onSpacePressed:
                root.createClicked()
            onClicked: root.createClicked()
        }
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        CTextField {
            Layout.preferredWidth: 280
            label: "Search"
            placeholderText:
                "Filter "
                + root.selectedEntity
                    .toLowerCase()
                + " records..."
            text: root.searchText
            activeFocusOnTab: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Search "
                + root.selectedEntity
                + " records"
            onTextChanged:
                root.searchChanged(text)
        }
        Item { Layout.preferredWidth: 12 }
        Repeater {
            model: ["All", "Active", "Inactive"]
            delegate: CChip {
                text: modelData
                checked: root.activeFilter
                    === modelData
                chipColor: root.activeFilter
                    === modelData
                    ? Theme.primary
                    : Theme.surface
                activeFocusOnTab: true
                Accessible.role: Accessible.CheckBox
                Accessible.name:
                    "Filter: " + modelData
                Accessible.description:
                    checked
                    ? modelData + " filter active"
                    : modelData + " filter inactive"
                Keys.onReturnPressed:
                    root.filterChanged(modelData)
                Keys.onSpacePressed:
                    root.filterChanged(modelData)
                onClicked:
                    root.filterChanged(modelData)
            }
        }
        Item { Layout.fillWidth: true }
        CButton {
            text: "Delete Selected"
            variant: "danger"
            size: "sm"
            enabled: root.hasSelectedRows
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Delete Selected"
            Accessible.description:
                "Delete all selected "
                + root.selectedEntity
                + " records"
            Keys.onReturnPressed:
                root.deleteSelectedClicked()
            Keys.onSpacePressed:
                root.deleteSelectedClicked()
            onClicked:
                root.deleteSelectedClicked()
        }
    }
}

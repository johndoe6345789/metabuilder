import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "DropdownCrud.js" as Crud

Rectangle {
    id: root
    color: Theme.background
    objectName: "view_dropdown_config"
    Accessible.role: Accessible.Pane
    Accessible.name: "Dropdown Configuration"

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property int selectedIndex: -1
    property bool addDialogOpen: false
    property bool deleteDialogOpen: false
    property var dropdowns: []

    function selectedDropdown() {
        return (selectedIndex >= 0
            && selectedIndex < dropdowns.length)
            ? dropdowns[selectedIndex]
            : null
    }

    function applyUpdate(updated) {
        dropdowns = updated
        if (useLiveData)
            saveDropdown(selectedIndex)
    }

    function loadDropdowns() {
        dbal.execute(
            "core/dropdown-configs", {},
            function(result, error) {
                if (!error && result
                    && result.items
                    && result.items.length > 0) {
                    dropdowns =
                        Crud.parseDbalItems(
                            result.items)
                    if (selectedIndex
                        >= dropdowns.length)
                        selectedIndex =
                            dropdowns.length > 0
                            ? dropdowns.length - 1
                            : -1
                }
            })
    }

    function saveDropdown(index) {
        if (!useLiveData || index < 0
            || index >= dropdowns.length)
            return
        var dd = dropdowns[index]
        var data = Crud.toSaveData(dd)
        if (dd.id)
            dbal.execute(
                "core/dropdown-configs/update",
                { id: dd.id, data: data },
                function(r, e) {})
        else
            dbal.execute(
                "core/dropdown-configs/create",
                { data: data },
                function(r, e) {
                    if (!e) loadDropdowns()
                })
    }

    Component.onCompleted: {
        Crud.loadJson(
            "config/dropdown-defaults.json",
            function(data) {
                dropdowns = data
            })
        loadDropdowns()
    }
    onUseLiveDataChanged: {
        if (useLiveData) loadDropdowns()
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20; spacing: 16

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText {
                variant: "h3"
                text: "Dropdown Configuration"
                    + " Manager"
            }
            Item { Layout.fillWidth: true }
            CBadge {
                text: dropdowns.length
                    + " dropdowns"
            }
        }
        CText {
            variant: "body2"
            text: "Configure dropdown/select"
                + " field options used across"
                + " all packages and entities."
            color: Theme.text; opacity: 0.7
        }
        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            DropdownSidebar {
                Layout.preferredWidth: 320
                Layout.fillHeight: true
                dropdowns: root.dropdowns
                selectedIndex:
                    root.selectedIndex
                onItemClicked: function(idx) {
                    root.selectedIndex = idx
                }
                onAddClicked:
                    addDialogOpen = true
            }

            CDropdownEditorPanel {
                dropdown: selectedDropdown()
                selectedIndex:
                    root.selectedIndex
                onDeleteClicked:
                    deleteDialogOpen = true
                onFieldChanged:
                    function(f, v) {
                    applyUpdate(
                        Crud.updateField(
                            dropdowns,
                            selectedIndex,
                            f, v))
                }
                onAddOptionClicked:
                    applyUpdate(
                        Crud.addOption(
                            dropdowns,
                            selectedIndex))
                onRemoveOptionClicked:
                    function(i) {
                    applyUpdate(
                        Crud.removeOption(
                            dropdowns,
                            selectedIndex, i))
                }
                onMoveOptionClicked:
                    function(i, d) {
                    applyUpdate(
                        Crud.moveOption(
                            dropdowns,
                            selectedIndex,
                            i, d))
                }
                onOptionFieldChanged:
                    function(i, f, v) {
                    applyUpdate(
                        Crud.updateOptionField(
                            dropdowns,
                            selectedIndex,
                            i, f, v))
                }
            }
        }
    }

    CAddDropdownDialog {
        visible: addDialogOpen
        onCreateRequested:
            function(name, desc) {
            var newDd =
                Crud.createDropdown(name, desc)
            if (useLiveData)
                dbal.execute(
                    "core/dropdown-configs"
                    + "/create",
                    { data: newDd },
                    function(r, e) {
                        if (!e) loadDropdowns()
                    })
            dropdowns = Crud.addDropdown(
                dropdowns, newDd)
            selectedIndex =
                dropdowns.length - 1
            addDialogOpen = false
        }
        onCancelled: addDialogOpen = false
    }

    CDeleteDropdownDialog {
        visible: deleteDialogOpen
        dropdown: selectedDropdown()
        onConfirmed: {
            if (useLiveData
                && dropdowns[selectedIndex]
                && dropdowns[selectedIndex].id)
                dbal.execute(
                    "core/dropdown-configs"
                    + "/delete",
                    { id: dropdowns[
                        selectedIndex].id },
                    function(r, e) {
                        if (!e) loadDropdowns()
                    })
            dropdowns = Crud.removeDropdown(
                dropdowns, selectedIndex)
            selectedIndex =
                dropdowns.length > 0
                ? Math.min(selectedIndex,
                    dropdowns.length - 1)
                : -1
            deleteDialogOpen = false
        }
        onCancelled: deleteDialogOpen = false
    }
}

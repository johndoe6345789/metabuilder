import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property int selectedIndex: -1
    property bool addDialogOpen: false
    property bool deleteDialogOpen: false

    property var dropdowns: []

    Component.onCompleted: {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                dropdowns = JSON.parse(xhr.responseText)
            }
        }
        xhr.open("GET", "config/dropdown-defaults.json")
        xhr.send()
        loadDropdowns()
    }

    function selectedDropdown() {
        if (selectedIndex < 0 || selectedIndex >= dropdowns.length) return null
        return dropdowns[selectedIndex]
    }

    function updateDropdown(index, updated) {
        var copy = dropdowns.slice(); copy[index] = updated; dropdowns = copy
        if (useLiveData) saveDropdown(index)
    }

    function updateSelectedField(field, value) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex])); dd[field] = value; updateDropdown(selectedIndex, dd)
    }

    function addOption() {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        dd.options.push({ label: "New Option", value: "new_option_" + dd.options.length }); updateDropdown(selectedIndex, dd)
    }

    function removeOption(optIndex) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex])); dd.options.splice(optIndex, 1); updateDropdown(selectedIndex, dd)
    }

    function moveOption(optIndex, direction) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        var t = optIndex + direction; if (t < 0 || t >= dd.options.length) return
        var tmp = dd.options[optIndex]; dd.options[optIndex] = dd.options[t]; dd.options[t] = tmp; updateDropdown(selectedIndex, dd)
    }

    function updateOptionField(optIndex, field, value) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex])); dd.options[optIndex][field] = value; updateDropdown(selectedIndex, dd)
    }

    function addDropdown(name, description) {
        if (name.trim() === "") return
        var newDd = { name: name.trim().toLowerCase().replace(/ /g, "_"), description: description.trim() || "No description", allowCustom: false, required: false, options: [{ label: "Option 1", value: "option_1" }] }
        if (useLiveData) dbal.execute("core/dropdown-configs/create", { data: newDd }, function(r, e) { if (!e) loadDropdowns() })
        var copy = dropdowns.slice(); copy.push(newDd); dropdowns = copy
        selectedIndex = dropdowns.length - 1; addDialogOpen = false
    }

    function deleteSelectedDropdown() {
        if (selectedIndex < 0) return
        if (useLiveData && dropdowns[selectedIndex].id) dbal.execute("core/dropdown-configs/delete", { id: dropdowns[selectedIndex].id }, function(r, e) { if (!e) loadDropdowns() })
        var copy = dropdowns.slice(); copy.splice(selectedIndex, 1); dropdowns = copy
        selectedIndex = copy.length > 0 ? Math.min(selectedIndex, copy.length - 1) : -1; deleteDialogOpen = false
    }

    // ── DBAL Integration ─────────────────────────────────────────────
    function loadDropdowns() {
        dbal.execute("core/dropdown-configs", {}, function(result, error) {
            if (!error && result && result.items && result.items.length > 0) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var d = result.items[i]
                    parsed.push({ id: d.id, name: d.name || "", description: d.description || "", allowCustom: d.allowCustom || false, required: d.required || false, options: d.options || [] })
                }
                dropdowns = parsed
                if (selectedIndex >= dropdowns.length) selectedIndex = dropdowns.length > 0 ? dropdowns.length - 1 : -1
            }
        })
    }
    onUseLiveDataChanged: { if (useLiveData) loadDropdowns() }

    function saveDropdown(index) {
        if (!useLiveData || index < 0 || index >= dropdowns.length) return
        var dd = dropdowns[index]
        var data = { name: dd.name, description: dd.description, allowCustom: dd.allowCustom, required: dd.required, options: dd.options }
        if (dd.id) dbal.execute("core/dropdown-configs/update", { id: dd.id, data: data }, function(r, e) {})
        else dbal.execute("core/dropdown-configs/create", { data: data }, function(r, e) { if (!e) loadDropdowns() })
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h3"; text: "Dropdown Configuration Manager" }
            Item { Layout.fillWidth: true }
            CBadge { text: dropdowns.length + " dropdowns" }
        }

        CText { variant: "body2"; text: "Configure dropdown/select field options used across all packages and entities."; color: Theme.text; opacity: 0.7 }
        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            DropdownSidebar {
                Layout.preferredWidth: 320
                Layout.fillHeight: true
                dropdowns: root.dropdowns
                selectedIndex: root.selectedIndex
                onItemClicked: function(idx) { root.selectedIndex = idx }
                onAddClicked: addDialogOpen = true
            }

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    Item {
                        Layout.fillWidth: true; Layout.fillHeight: true; visible: selectedIndex < 0
                        CText { anchors.centerIn: parent; variant: "body1"; text: "Select a dropdown from the list to edit its configuration."; color: Theme.text; opacity: 0.5 }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true; Layout.fillHeight: true; spacing: 12; visible: selectedIndex >= 0

                        FlexRow {
                            Layout.fillWidth: true; spacing: 12
                            CText { variant: "h4"; text: selectedDropdown() ? selectedDropdown().name : "" }
                            Item { Layout.fillWidth: true }
                            CButton { text: "Delete"; variant: "danger"; size: "sm"; onClicked: deleteDialogOpen = true }
                        }

                        CDivider { Layout.fillWidth: true }

                        Flickable {
                            Layout.fillWidth: true; Layout.fillHeight: true
                            contentHeight: editorColumn.implicitHeight; clip: true; boundsBehavior: Flickable.StopAtBounds

                            ColumnLayout {
                                id: editorColumn
                                width: parent.width
                                spacing: 16

                                DropdownGeneralForm {
                                    Layout.fillWidth: true
                                    dropdown: selectedDropdown()
                                    onFieldChanged: function(field, value) { updateSelectedField(field, value) }
                                }

                                CDivider { Layout.fillWidth: true }

                                DropdownOptionsEditor {
                                    Layout.fillWidth: true
                                    dropdown: selectedDropdown()
                                    onAddOptionClicked: addOption()
                                    onRemoveOptionClicked: function(idx) { removeOption(idx) }
                                    onMoveOptionClicked: function(idx, dir) { moveOption(idx, dir) }
                                    onOptionFieldChanged: function(idx, field, val) { updateOptionField(idx, field, val) }
                                }

                                CDivider { Layout.fillWidth: true }

                                CText { variant: "body2"; text: "Preview"; font.bold: true }

                                DropdownPreview {
                                    Layout.fillWidth: true
                                    dropdown: selectedDropdown()
                                }

                                Item { Layout.preferredHeight: 16 }
                            }
                        }
                    }
                }
            }
        }
    }

    // Add Dropdown Dialog
    CAddDropdownDialog {
        visible: addDialogOpen
        onCreateRequested: function(name, description) { addDropdown(name, description) }
        onCancelled: addDialogOpen = false
    }

    // Delete Confirmation Dialog
    CDialog {
        visible: deleteDialogOpen; title: "Delete Dropdown"
        ColumnLayout {
            spacing: 16; width: 400
            CAlert { severity: "warning"; text: "This action cannot be undone. Any forms referencing this dropdown will need to be updated."; Layout.fillWidth: true }
            CText { variant: "body1"; text: selectedDropdown() ? "Are you sure you want to delete \"" + selectedDropdown().name + "\" with " + selectedDropdown().options.length + " options?" : ""; wrapMode: Text.WordWrap }
            FlexRow {
                Layout.fillWidth: true; spacing: 8; Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; onClicked: deleteDialogOpen = false }
                CButton { text: "Delete"; variant: "danger"; onClicked: deleteSelectedDropdown() }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property int selectedIndex: -1
    property bool addDialogOpen: false
    property bool deleteDialogOpen: false
    property string newDropdownName: ""
    property string newDropdownDescription: ""

    property var dropdowns: [
        {
            name: "user_roles",
            description: "Assignable user roles for access control",
            allowCustom: false,
            required: true,
            options: [
                { label: "Administrator", value: "admin" },
                { label: "Moderator", value: "moderator" },
                { label: "Editor", value: "editor" },
                { label: "Viewer", value: "viewer" },
                { label: "Guest", value: "guest" }
            ]
        },
        {
            name: "content_status",
            description: "Publication lifecycle status for content items",
            allowCustom: false,
            required: true,
            options: [
                { label: "Draft", value: "draft" },
                { label: "In Review", value: "in_review" },
                { label: "Published", value: "published" },
                { label: "Archived", value: "archived" }
            ]
        },
        {
            name: "priority_levels",
            description: "Task and issue priority classifications",
            allowCustom: false,
            required: true,
            options: [
                { label: "Critical", value: "critical" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
                { label: "None", value: "none" }
            ]
        },
        {
            name: "categories",
            description: "General-purpose content categorization tags",
            allowCustom: true,
            required: false,
            options: [
                { label: "Technology", value: "technology" },
                { label: "Design", value: "design" },
                { label: "Business", value: "business" },
                { label: "Science", value: "science" },
                { label: "Education", value: "education" },
                { label: "Entertainment", value: "entertainment" }
            ]
        },
        {
            name: "languages",
            description: "Supported interface and content languages",
            allowCustom: false,
            required: true,
            options: [
                { label: "English", value: "en" },
                { label: "Spanish", value: "es" },
                { label: "French", value: "fr" },
                { label: "German", value: "de" },
                { label: "Japanese", value: "ja" },
                { label: "Chinese", value: "zh" },
                { label: "Portuguese", value: "pt" }
            ]
        },
        {
            name: "themes",
            description: "Available UI theme presets",
            allowCustom: true,
            required: false,
            options: [
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System Default", value: "system" },
                { label: "High Contrast", value: "high_contrast" }
            ]
        },
        {
            name: "database_backends",
            description: "Supported DBAL database adapter backends",
            allowCustom: false,
            required: true,
            options: [
                { label: "SQLite", value: "sqlite" },
                { label: "PostgreSQL", value: "postgres" },
                { label: "MySQL", value: "mysql" },
                { label: "MariaDB", value: "mariadb" },
                { label: "MongoDB", value: "mongodb" },
                { label: "Redis", value: "redis" },
                { label: "CockroachDB", value: "cockroachdb" },
                { label: "SurrealDB", value: "surrealdb" },
                { label: "Supabase", value: "supabase" },
                { label: "In-Memory", value: "memory" }
            ]
        }
    ]

    function selectedDropdown() {
        if (selectedIndex < 0 || selectedIndex >= dropdowns.length) return null
        return dropdowns[selectedIndex]
    }

    function updateDropdown(index, updated) {
        var copy = dropdowns.slice()
        copy[index] = updated
        dropdowns = copy
        if (useLiveData) saveDropdown(index)
    }

    function updateSelectedField(field, value) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        dd[field] = value
        updateDropdown(selectedIndex, dd)
    }

    function addOption() {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        dd.options.push({ label: "New Option", value: "new_option_" + dd.options.length })
        updateDropdown(selectedIndex, dd)
    }

    function removeOption(optIndex) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        dd.options.splice(optIndex, 1)
        updateDropdown(selectedIndex, dd)
    }

    function moveOption(optIndex, direction) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        var targetIndex = optIndex + direction
        if (targetIndex < 0 || targetIndex >= dd.options.length) return
        var temp = dd.options[optIndex]
        dd.options[optIndex] = dd.options[targetIndex]
        dd.options[targetIndex] = temp
        updateDropdown(selectedIndex, dd)
    }

    function updateOptionField(optIndex, field, value) {
        if (selectedIndex < 0) return
        var dd = JSON.parse(JSON.stringify(dropdowns[selectedIndex]))
        dd.options[optIndex][field] = value
        updateDropdown(selectedIndex, dd)
    }

    function addDropdown() {
        if (newDropdownName.trim() === "") return
        var newDd = {
            name: newDropdownName.trim().toLowerCase().replace(/ /g, "_"),
            description: newDropdownDescription.trim() || "No description",
            allowCustom: false,
            required: false,
            options: [{ label: "Option 1", value: "option_1" }]
        }
        if (useLiveData) {
            dbal.execute("core/dropdown-configs/create", { data: newDd }, function(r, e) { if (!e) loadDropdowns() })
        }
        var copy = dropdowns.slice()
        copy.push(newDd)
        dropdowns = copy
        selectedIndex = dropdowns.length - 1
        newDropdownName = ""
        newDropdownDescription = ""
        addDialogOpen = false
    }

    function deleteSelectedDropdown() {
        if (selectedIndex < 0) return
        if (useLiveData && dropdowns[selectedIndex].id) {
            dbal.execute("core/dropdown-configs/delete", { id: dropdowns[selectedIndex].id }, function(r, e) { if (!e) loadDropdowns() })
        }
        var copy = dropdowns.slice()
        copy.splice(selectedIndex, 1)
        dropdowns = copy
        selectedIndex = copy.length > 0 ? Math.min(selectedIndex, copy.length - 1) : -1
        deleteDialogOpen = false
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
    Component.onCompleted: { loadDropdowns() }

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

        // Header
        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "h3"; text: "Dropdown Configuration Manager" }
            Item { Layout.fillWidth: true }
            CBadge { text: dropdowns.length + " dropdowns" }
        }

        CText {
            variant: "body2"
            text: "Configure dropdown/select field options used across all packages and entities."
            color: Theme.text
            opacity: 0.7
        }

        CDivider { Layout.fillWidth: true }

        // Main content: sidebar + editor
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // Left sidebar: dropdown list
            CCard {
                Layout.preferredWidth: 320
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
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
                            onClicked: addDialogOpen = true
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    ListView {
                        id: dropdownList
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: dropdowns
                        spacing: 4
                        clip: true

                        delegate: CListItem {
                            width: dropdownList.width
                            title: modelData.name
                            subtitle: modelData.description
                            selected: index === selectedIndex
                            onClicked: selectedIndex = index

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

            // Right panel: editor + preview
            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    // No selection state
                    Item {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        visible: selectedIndex < 0

                        CText {
                            anchors.centerIn: parent
                            variant: "body1"
                            text: "Select a dropdown from the list to edit its configuration."
                            color: Theme.text
                            opacity: 0.5
                        }
                    }

                    // Editor content (visible when a dropdown is selected)
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 12
                        visible: selectedIndex >= 0

                        // Editor header
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CText {
                                variant: "h4"
                                text: selectedDropdown() ? selectedDropdown().name : ""
                            }
                            Item { Layout.fillWidth: true }
                            CButton {
                                text: "Delete"
                                variant: "danger"
                                size: "sm"
                                onClicked: deleteDialogOpen = true
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // Scrollable editor area
                        Flickable {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            contentHeight: editorColumn.implicitHeight
                            clip: true
                            boundsBehavior: Flickable.StopAtBounds

                            ColumnLayout {
                                id: editorColumn
                                width: parent.width
                                spacing: 16

                                // Name and description fields
                                CText { variant: "body2"; text: "General"; font.bold: true }

                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 12

                                    CTextField {
                                        label: "Name"
                                        placeholderText: "dropdown_name"
                                        text: selectedDropdown() ? selectedDropdown().name : ""
                                        Layout.fillWidth: true
                                        onTextChanged: {
                                            if (selectedDropdown() && text !== selectedDropdown().name) {
                                                updateSelectedField("name", text)
                                            }
                                        }
                                    }

                                    CTextField {
                                        label: "Description"
                                        placeholderText: "What is this dropdown for?"
                                        text: selectedDropdown() ? selectedDropdown().description : ""
                                        Layout.fillWidth: true
                                        onTextChanged: {
                                            if (selectedDropdown() && text !== selectedDropdown().description) {
                                                updateSelectedField("description", text)
                                            }
                                        }
                                    }
                                }

                                // Toggles
                                RowLayout {
                                    Layout.fillWidth: true
                                    spacing: 24

                                    RowLayout {
                                        spacing: 8
                                        Switch {
                                            id: allowCustomSwitch
                                            checked: selectedDropdown() ? selectedDropdown().allowCustom : false
                                            onCheckedChanged: {
                                                if (selectedDropdown() && checked !== selectedDropdown().allowCustom) {
                                                    updateSelectedField("allowCustom", checked)
                                                }
                                            }
                                        }
                                        CText {
                                            variant: "body2"
                                            text: "Allow custom values"
                                        }
                                    }

                                    RowLayout {
                                        spacing: 8
                                        Switch {
                                            id: requiredSwitch
                                            checked: selectedDropdown() ? selectedDropdown().required : false
                                            onCheckedChanged: {
                                                if (selectedDropdown() && checked !== selectedDropdown().required) {
                                                    updateSelectedField("required", checked)
                                                }
                                            }
                                        }
                                        CText {
                                            variant: "body2"
                                            text: "Required"
                                        }
                                    }

                                    Item { Layout.fillWidth: true }

                                    CBadge {
                                        text: (selectedDropdown() && selectedDropdown().required ? "Required" : "Optional")
                                        accent: selectedDropdown() ? selectedDropdown().required : false
                                    }
                                    CBadge {
                                        text: (selectedDropdown() && selectedDropdown().allowCustom ? "Custom allowed" : "Fixed options")
                                        visible: true
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Options header
                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 8

                                    CText { variant: "body2"; text: "Options"; font.bold: true }
                                    CBadge { text: selectedDropdown() ? selectedDropdown().options.length + " items" : "0 items" }
                                    Item { Layout.fillWidth: true }
                                    CButton {
                                        text: "+ Add Option"
                                        variant: "primary"
                                        size: "sm"
                                        onClicked: addOption()
                                    }
                                }

                                // Options list
                                Repeater {
                                    id: optionsRepeater
                                    model: selectedDropdown() ? selectedDropdown().options : []

                                    CPaper {
                                        Layout.fillWidth: true
                                        implicitHeight: optionRow.implicitHeight + 24

                                        RowLayout {
                                            id: optionRow
                                            anchors.fill: parent
                                            anchors.margins: 12
                                            spacing: 8

                                            // Index indicator
                                            CText {
                                                variant: "caption"
                                                text: (index + 1) + "."
                                                Layout.preferredWidth: 24
                                                color: Theme.text
                                                opacity: 0.5
                                            }

                                            CTextField {
                                                label: "Label"
                                                placeholderText: "Display label"
                                                text: modelData.label
                                                Layout.fillWidth: true
                                                onTextChanged: {
                                                    if (text !== modelData.label) {
                                                        updateOptionField(index, "label", text)
                                                    }
                                                }
                                            }

                                            CTextField {
                                                label: "Value"
                                                placeholderText: "stored_value"
                                                text: modelData.value
                                                Layout.fillWidth: true
                                                onTextChanged: {
                                                    if (text !== modelData.value) {
                                                        updateOptionField(index, "value", text)
                                                    }
                                                }
                                            }

                                            // Reorder buttons
                                            ColumnLayout {
                                                spacing: 2
                                                CButton {
                                                    text: "\u25B2"
                                                    variant: "ghost"
                                                    size: "sm"
                                                    enabled: index > 0
                                                    onClicked: moveOption(index, -1)
                                                }
                                                CButton {
                                                    text: "\u25BC"
                                                    variant: "ghost"
                                                    size: "sm"
                                                    enabled: selectedDropdown() ? index < selectedDropdown().options.length - 1 : false
                                                    onClicked: moveOption(index, 1)
                                                }
                                            }

                                            CButton {
                                                text: "X"
                                                variant: "danger"
                                                size: "sm"
                                                onClicked: removeOption(index)
                                            }
                                        }
                                    }
                                }

                                CDivider { Layout.fillWidth: true }

                                // Preview section
                                CText { variant: "body2"; text: "Preview"; font.bold: true }

                                CPaper {
                                    Layout.fillWidth: true
                                    implicitHeight: previewColumn.implicitHeight + 32

                                    ColumnLayout {
                                        id: previewColumn
                                        anchors.fill: parent
                                        anchors.margins: 16
                                        spacing: 12

                                        CText {
                                            variant: "caption"
                                            text: "This is how the dropdown will render in forms:"
                                            color: Theme.text
                                            opacity: 0.6
                                        }

                                        // Simulated dropdown label
                                        ColumnLayout {
                                            Layout.fillWidth: true
                                            spacing: 4

                                            CText {
                                                variant: "body2"
                                                text: (selectedDropdown() ? selectedDropdown().name : "") + (selectedDropdown() && selectedDropdown().required ? " *" : "")
                                                font.bold: true
                                            }

                                            // Simulated select box
                                            Rectangle {
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 40
                                                color: Theme.surface
                                                border.color: Theme.border
                                                border.width: 1
                                                radius: 4

                                                RowLayout {
                                                    anchors.fill: parent
                                                    anchors.leftMargin: 12
                                                    anchors.rightMargin: 12
                                                    spacing: 8

                                                    CText {
                                                        variant: "body1"
                                                        text: selectedDropdown() && selectedDropdown().options.length > 0
                                                            ? selectedDropdown().options[0].label
                                                            : "No options"
                                                        Layout.fillWidth: true
                                                        color: Theme.text
                                                    }
                                                    CText {
                                                        variant: "body2"
                                                        text: "\u25BE"
                                                        color: Theme.text
                                                        opacity: 0.5
                                                    }
                                                }
                                            }

                                            CText {
                                                variant: "caption"
                                                text: selectedDropdown() ? selectedDropdown().description : ""
                                                color: Theme.text
                                                opacity: 0.5
                                            }
                                        }

                                        CDivider { Layout.fillWidth: true }

                                        // Simulated expanded dropdown list
                                        CText {
                                            variant: "caption"
                                            text: "Expanded view:"
                                            color: Theme.text
                                            opacity: 0.6
                                        }

                                        Rectangle {
                                            Layout.fillWidth: true
                                            Layout.preferredHeight: previewOptionsList.implicitHeight + 8
                                            color: Theme.surface
                                            border.color: Theme.border
                                            border.width: 1
                                            radius: 4

                                            ColumnLayout {
                                                id: previewOptionsList
                                                anchors.left: parent.left
                                                anchors.right: parent.right
                                                anchors.top: parent.top
                                                anchors.margins: 4
                                                spacing: 0

                                                Repeater {
                                                    model: selectedDropdown() ? selectedDropdown().options : []

                                                    Rectangle {
                                                        Layout.fillWidth: true
                                                        Layout.preferredHeight: 36
                                                        color: previewOptionMouse.containsMouse ? Theme.primary : "transparent"
                                                        opacity: previewOptionMouse.containsMouse ? 0.12 : 1.0
                                                        radius: 2

                                                        RowLayout {
                                                            anchors.fill: parent
                                                            anchors.leftMargin: 12
                                                            anchors.rightMargin: 12
                                                            spacing: 8

                                                            CText {
                                                                variant: "body1"
                                                                text: modelData.label
                                                                Layout.fillWidth: true
                                                            }
                                                            CText {
                                                                variant: "caption"
                                                                text: modelData.value
                                                                color: Theme.text
                                                                opacity: 0.4
                                                            }
                                                        }

                                                        MouseArea {
                                                            id: previewOptionMouse
                                                            anchors.fill: parent
                                                            hoverEnabled: true
                                                            cursorShape: Qt.PointingHandCursor
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        // Metadata summary
                                        FlexRow {
                                            Layout.fillWidth: true
                                            spacing: 8

                                            CBadge { text: selectedDropdown() ? selectedDropdown().options.length + " options" : "0 options" }
                                            CBadge {
                                                text: selectedDropdown() && selectedDropdown().required ? "Required" : "Optional"
                                                accent: selectedDropdown() ? selectedDropdown().required : false
                                            }
                                            CBadge {
                                                text: selectedDropdown() && selectedDropdown().allowCustom ? "Custom values OK" : "Fixed options only"
                                            }
                                        }
                                    }
                                }

                                // Bottom spacer
                                Item { Layout.preferredHeight: 16 }
                            }
                        }
                    }
                }
            }
        }
    }

    // Add Dropdown Dialog
    CDialog {
        id: addDialog
        visible: addDialogOpen
        title: "Add New Dropdown"

        ColumnLayout {
            spacing: 16
            width: 400

            CText {
                variant: "body2"
                text: "Create a new dropdown configuration. The name will be normalized to snake_case."
            }

            CTextField {
                label: "Dropdown Name"
                placeholderText: "e.g. ticket_types"
                text: newDropdownName
                Layout.fillWidth: true
                onTextChanged: newDropdownName = text
            }

            CTextField {
                label: "Description"
                placeholderText: "What will this dropdown be used for?"
                text: newDropdownDescription
                Layout.fillWidth: true
                onTextChanged: newDropdownDescription = text
            }

            CAlert {
                severity: "info"
                text: "A default option will be added. You can configure options after creation."
                Layout.fillWidth: true
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: {
                        addDialogOpen = false
                        newDropdownName = ""
                        newDropdownDescription = ""
                    }
                }
                CButton {
                    text: "Create"
                    variant: "primary"
                    enabled: newDropdownName.trim() !== ""
                    onClicked: addDropdown()
                }
            }
        }
    }

    // Delete Confirmation Dialog
    CDialog {
        id: deleteDialog
        visible: deleteDialogOpen
        title: "Delete Dropdown"

        ColumnLayout {
            spacing: 16
            width: 400

            CAlert {
                severity: "warning"
                text: "This action cannot be undone. Any forms referencing this dropdown will need to be updated."
                Layout.fillWidth: true
            }

            CText {
                variant: "body1"
                text: selectedDropdown()
                    ? "Are you sure you want to delete \"" + selectedDropdown().name + "\" with " + selectedDropdown().options.length + " options?"
                    : ""
                wrapMode: Text.WordWrap
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: deleteDialogOpen = false
                }
                CButton {
                    text: "Delete"
                    variant: "danger"
                    onClicked: deleteSelectedDropdown()
                }
            }
        }
    }
}

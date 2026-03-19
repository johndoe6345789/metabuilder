import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: Theme.background

    // ── Mock data ──────────────────────────────────────────────────────
    property var cssClasses: [
        {
            name: "card-primary",
            usageCount: 14,
            properties: [
                { prop: "background-color", value: "#1976d2" },
                { prop: "border-radius",    value: "12px" },
                { prop: "padding",          value: "16px" },
                { prop: "color",            value: "#ffffff" }
            ]
        },
        {
            name: "card-dark",
            usageCount: 9,
            properties: [
                { prop: "background-color", value: "#1e1e2e" },
                { prop: "border-radius",    value: "8px" },
                { prop: "color",            value: "#cdd6f4" },
                { prop: "padding",          value: "20px" }
            ]
        },
        {
            name: "text-accent",
            usageCount: 22,
            properties: [
                { prop: "color",       value: "#f59e0b" },
                { prop: "font-size",   value: "14px" },
                { prop: "opacity",     value: "0.95" }
            ]
        },
        {
            name: "btn-glow",
            usageCount: 6,
            properties: [
                { prop: "background-color", value: "#7c3aed" },
                { prop: "border-radius",    value: "24px" },
                { prop: "box-shadow",       value: "0 0 12px rgba(124,58,237,0.5)" },
                { prop: "color",            value: "#ffffff" },
                { prop: "padding",          value: "10px 24px" }
            ]
        },
        {
            name: "surface-elevated",
            usageCount: 17,
            properties: [
                { prop: "background-color", value: "#2a2a3c" },
                { prop: "border-radius",    value: "6px" },
                { prop: "box-shadow",       value: "0 4px 12px rgba(0,0,0,0.3)" },
                { prop: "padding",          value: "12px" }
            ]
        },
        {
            name: "badge-live",
            usageCount: 3,
            properties: [
                { prop: "background-color", value: "#ef4444" },
                { prop: "border-radius",    value: "999px" },
                { prop: "color",            value: "#ffffff" },
                { prop: "font-size",        value: "11px" },
                { prop: "padding",          value: "2px 8px" }
            ]
        },
        {
            name: "panel-glass",
            usageCount: 8,
            properties: [
                { prop: "background-color", value: "rgba(255,255,255,0.06)" },
                { prop: "border-radius",    value: "16px" },
                { prop: "opacity",          value: "0.9" },
                { prop: "padding",          value: "24px" }
            ]
        }
    ]

    property int selectedClassIndex: 0
    property bool showAddClassDialog: false
    property bool showDeleteConfirm: false
    property string newClassName: ""
    property bool showSuggestions: false
    property int editingPropertyIndex: -1

    property var propertySuggestions: [
        "color", "background-color", "border-radius", "padding",
        "font-size", "opacity", "box-shadow", "margin",
        "border", "font-weight", "text-align", "line-height"
    ]

    // ── Helpers ─────────────────────────────────────────────────────────

    function selectedClass() {
        if (selectedClassIndex >= 0 && selectedClassIndex < cssClasses.length)
            return cssClasses[selectedClassIndex]
        return null
    }

    function updateClasses(arr) {
        cssClasses = arr
    }

    function addPropertyToSelected() {
        var cls = cssClasses.slice()
        var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice()
        props.push({ prop: "property", value: "value" })
        entry.properties = props
        cls[selectedClassIndex] = entry
        updateClasses(cls)
    }

    function removePropertyFromSelected(propIndex) {
        var cls = cssClasses.slice()
        var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice()
        props.splice(propIndex, 1)
        entry.properties = props
        cls[selectedClassIndex] = entry
        updateClasses(cls)
    }

    function setPropertyName(propIndex, name) {
        var cls = cssClasses.slice()
        var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice()
        props[propIndex] = { prop: name, value: props[propIndex].value }
        entry.properties = props
        cls[selectedClassIndex] = entry
        updateClasses(cls)
    }

    function setPropertyValue(propIndex, val) {
        var cls = cssClasses.slice()
        var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice()
        props[propIndex] = { prop: props[propIndex].prop, value: val }
        entry.properties = props
        cls[selectedClassIndex] = entry
        updateClasses(cls)
    }

    function setClassName(name) {
        var cls = cssClasses.slice()
        var entry = Object.assign({}, cls[selectedClassIndex])
        entry.name = name
        cls[selectedClassIndex] = entry
        updateClasses(cls)
    }

    function addClass(name) {
        var cls = cssClasses.slice()
        cls.push({
            name: name,
            usageCount: 0,
            properties: [{ prop: "color", value: "#ffffff" }]
        })
        updateClasses(cls)
        selectedClassIndex = cls.length - 1
    }

    function deleteSelectedClass() {
        if (cssClasses.length <= 1) return
        var cls = cssClasses.slice()
        cls.splice(selectedClassIndex, 1)
        updateClasses(cls)
        if (selectedClassIndex >= cls.length)
            selectedClassIndex = cls.length - 1
    }

    function resolvePreviewColor(properties, name, fallback) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === name)
                return properties[i].value
        }
        return fallback
    }

    function resolvePreviewRadius(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === "border-radius")
                return parseInt(properties[i].value) || 0
        }
        return 0
    }

    function resolvePreviewOpacity(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === "opacity")
                return parseFloat(properties[i].value) || 1.0
        }
        return 1.0
    }

    function swatchColor(properties) {
        var bg = resolvePreviewColor(properties, "background-color", "")
        if (bg) return bg
        return resolvePreviewColor(properties, "color", Theme.surface)
    }

    // ── Layout ──────────────────────────────────────────────────────────

    ColumnLayout {
        anchors.fill: parent
        spacing: 16
        anchors.margins: 20

        // Header
        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "h3"; text: "CSS Class Manager" }

            Item { Layout.fillWidth: true }

            CBadge { text: cssClasses.length + " classes" }

            CButton {
                text: "Add Class"
                variant: "primary"
                size: "sm"
                onClicked: {
                    newClassName = ""
                    showAddClassDialog = true
                }
            }
        }

        CDivider { Layout.fillWidth: true }

        // Main split
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // ── Left: class list ────────────────────────────────────────
            CCard {
                Layout.preferredWidth: 280
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 10

                    CText { variant: "h4"; text: "Classes" }

                    ListView {
                        id: classListView
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: cssClasses
                        spacing: 4
                        clip: true

                        delegate: CListItem {
                            width: classListView.width
                            title: modelData.name
                            subtitle: modelData.properties.length + " properties"
                            selected: index === selectedClassIndex

                            // Swatch + usage badge row
                            Row {
                                anchors.right: parent.right
                                anchors.rightMargin: 12
                                anchors.verticalCenter: parent.verticalCenter
                                spacing: 8

                                Rectangle {
                                    width: 16; height: 16
                                    radius: 3
                                    color: swatchColor(modelData.properties)
                                    border.color: Theme.border
                                    border.width: 1
                                }

                                CBadge { text: modelData.usageCount.toString() }
                            }

                            onClicked: {
                                selectedClassIndex = index
                                showSuggestions = false
                                editingPropertyIndex = -1
                            }
                        }
                    }
                }
            }

            // ── Right: editor + preview ─────────────────────────────────
            ColumnLayout {
                Layout.fillWidth: true
                Layout.fillHeight: true
                spacing: 16

                // Editor card
                CCard {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    visible: selectedClass() !== null

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 12

                        // Class name + delete
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CTextField {
                                id: classNameField
                                Layout.preferredWidth: 260
                                label: "Class Name"
                                placeholderText: ".class-name"
                                text: selectedClass() ? selectedClass().name : ""
                                onTextChanged: {
                                    if (selectedClass() && text !== selectedClass().name)
                                        setClassName(text)
                                }
                            }

                            Item { Layout.fillWidth: true }

                            CButton {
                                text: "Delete Class"
                                variant: "danger"
                                size: "sm"
                                onClicked: showDeleteConfirm = true
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // Properties header
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            CText { variant: "h4"; text: "Properties" }

                            Item { Layout.fillWidth: true }

                            CButton {
                                text: "Add Property"
                                variant: "primary"
                                size: "sm"
                                onClicked: addPropertyToSelected()
                            }
                        }

                        // Property list
                        ListView {
                            id: propertyListView
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            model: selectedClass() ? selectedClass().properties : []
                            spacing: 6
                            clip: true

                            delegate: Item {
                                width: propertyListView.width
                                height: 48

                                RowLayout {
                                    anchors.fill: parent
                                    spacing: 8

                                    // Property name field with suggestions
                                    Item {
                                        Layout.preferredWidth: 200
                                        Layout.fillHeight: true

                                        CTextField {
                                            id: propNameField
                                            anchors.fill: parent
                                            label: index === 0 ? "Property" : ""
                                            placeholderText: "property-name"
                                            text: modelData.prop
                                            onTextChanged: {
                                                if (text !== modelData.prop)
                                                    setPropertyName(index, text)
                                            }
                                            onActiveFocusChanged: {
                                                if (activeFocus) {
                                                    editingPropertyIndex = index
                                                    showSuggestions = true
                                                } else {
                                                    // Delay hide so clicks on suggestions register
                                                    suggestHideTimer.start()
                                                }
                                            }
                                        }

                                        // Suggestions dropdown
                                        Rectangle {
                                            visible: showSuggestions && editingPropertyIndex === index
                                            anchors.top: propNameField.bottom
                                            anchors.left: propNameField.left
                                            width: propNameField.width
                                            height: Math.min(suggestCol.implicitHeight + 8, 180)
                                            z: 100
                                            color: Theme.paper
                                            border.color: Theme.border
                                            border.width: 1
                                            radius: 6
                                            clip: true

                                            Flickable {
                                                anchors.fill: parent
                                                anchors.margins: 4
                                                contentHeight: suggestCol.implicitHeight
                                                clip: true

                                                Column {
                                                    id: suggestCol
                                                    width: parent.width
                                                    spacing: 2

                                                    Repeater {
                                                        model: propertySuggestions

                                                        Rectangle {
                                                            width: suggestCol.width
                                                            height: 26
                                                            radius: 4
                                                            color: suggestMa.containsMouse ? Theme.surface : "transparent"

                                                            CText {
                                                                anchors.verticalCenter: parent.verticalCenter
                                                                anchors.left: parent.left
                                                                anchors.leftMargin: 8
                                                                variant: "body2"
                                                                text: modelData
                                                            }

                                                            MouseArea {
                                                                id: suggestMa
                                                                anchors.fill: parent
                                                                hoverEnabled: true
                                                                onClicked: {
                                                                    setPropertyName(editingPropertyIndex, modelData)
                                                                    showSuggestions = false
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    // Value field
                                    CTextField {
                                        Layout.fillWidth: true
                                        Layout.fillHeight: true
                                        label: index === 0 ? "Value" : ""
                                        placeholderText: "#000000"
                                        text: modelData.value
                                        onTextChanged: {
                                            if (text !== modelData.value)
                                                setPropertyValue(index, text)
                                        }
                                    }

                                    // Color swatch for color-like values
                                    Rectangle {
                                        Layout.preferredWidth: 24
                                        Layout.preferredHeight: 24
                                        Layout.alignment: Qt.AlignVCenter
                                        radius: 4
                                        border.color: Theme.border
                                        border.width: 1
                                        color: {
                                            var v = modelData.value
                                            if (v.charAt(0) === "#" || v.indexOf("rgb") === 0)
                                                return v
                                            return "transparent"
                                        }
                                        visible: {
                                            var p = modelData.prop
                                            return p === "color" || p === "background-color"
                                        }
                                    }

                                    // Remove property button
                                    CButton {
                                        text: "x"
                                        variant: "ghost"
                                        size: "sm"
                                        onClicked: removePropertyFromSelected(index)
                                    }
                                }
                            }
                        }
                    }
                }

                // ── Preview card ────────────────────────────────────────
                CCard {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 160
                    visible: selectedClass() !== null

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 10

                        CText { variant: "h4"; text: "Preview" }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            color: Theme.surface
                            radius: 6
                            border.color: Theme.border
                            border.width: 1

                            // Checkerboard background for transparency
                            Grid {
                                anchors.fill: parent
                                rows: Math.ceil(height / 12)
                                columns: Math.ceil(width / 12)
                                clip: true
                                Repeater {
                                    model: Math.ceil(parent.parent.width / 12) * Math.ceil(parent.parent.height / 12)
                                    Rectangle {
                                        width: 12; height: 12
                                        color: (Math.floor(index / Math.ceil(parent.parent.width / 12)) + index) % 2 === 0
                                               ? "#2a2a2a" : "#333333"
                                    }
                                }
                            }

                            // Rendered preview element
                            Rectangle {
                                id: previewRect
                                anchors.centerIn: parent
                                width: Math.min(parent.width - 40, 280)
                                height: Math.min(parent.height - 20, 72)
                                radius: selectedClass() ? resolvePreviewRadius(selectedClass().properties) : 0
                                opacity: selectedClass() ? resolvePreviewOpacity(selectedClass().properties) : 1.0
                                color: selectedClass()
                                       ? resolvePreviewColor(selectedClass().properties, "background-color", Theme.surface)
                                       : Theme.surface

                                CText {
                                    anchors.centerIn: parent
                                    variant: "body1"
                                    text: selectedClass() ? "." + selectedClass().name : ""
                                    color: selectedClass()
                                           ? resolvePreviewColor(selectedClass().properties, "color", Theme.text)
                                           : Theme.text
                                    font.pixelSize: {
                                        if (!selectedClass()) return 14
                                        var props = selectedClass().properties
                                        for (var i = 0; i < props.length; i++) {
                                            if (props[i].prop === "font-size")
                                                return parseInt(props[i].value) || 14
                                        }
                                        return 14
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ── Timer to delay hiding suggestions ───────────────────────────────
    Timer {
        id: suggestHideTimer
        interval: 200
        onTriggered: showSuggestions = false
    }

    // ── Add Class Dialog ────────────────────────────────────────────────
    CDialog {
        id: addClassDialog
        visible: showAddClassDialog
        title: "Add New Class"

        ColumnLayout {
            spacing: 16
            width: 320

            CText {
                variant: "body1"
                text: "Enter a name for the new CSS class."
            }

            CTextField {
                id: newClassNameField
                Layout.fillWidth: true
                label: "Class Name"
                placeholderText: "my-class"
                text: newClassName
                onTextChanged: newClassName = text
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                Item { Layout.fillWidth: true }

                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    size: "sm"
                    onClicked: showAddClassDialog = false
                }

                CButton {
                    text: "Create"
                    variant: "primary"
                    size: "sm"
                    enabled: newClassName.trim().length > 0
                    onClicked: {
                        addClass(newClassName.trim())
                        showAddClassDialog = false
                    }
                }
            }
        }
    }

    // ── Delete Confirmation Dialog ──────────────────────────────────────
    CDialog {
        id: deleteConfirmDialog
        visible: showDeleteConfirm
        title: "Delete Class"

        ColumnLayout {
            spacing: 16
            width: 320

            CAlert {
                Layout.fillWidth: true
                severity: "warning"
                text: selectedClass()
                      ? "Are you sure you want to delete \"." + selectedClass().name + "\"? This action cannot be undone."
                      : "No class selected."
            }

            CText {
                variant: "body2"
                text: selectedClass()
                      ? "This class is used in " + selectedClass().usageCount + " place(s)."
                      : ""
                visible: selectedClass() !== null && selectedClass().usageCount > 0
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8

                Item { Layout.fillWidth: true }

                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    size: "sm"
                    onClicked: showDeleteConfirm = false
                }

                CButton {
                    text: "Delete"
                    variant: "danger"
                    size: "sm"
                    onClicked: {
                        deleteSelectedClass()
                        showDeleteConfirm = false
                    }
                }
            }
        }
    }
}

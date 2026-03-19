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

    // ── State ──────────────────────────────────────────────────────────
    property var cssClasses: [
        { name: "card-primary", usageCount: 14, properties: [{ prop: "background-color", value: "#1976d2" }, { prop: "border-radius", value: "12px" }, { prop: "padding", value: "16px" }, { prop: "color", value: "#ffffff" }] },
        { name: "card-dark", usageCount: 9, properties: [{ prop: "background-color", value: "#1e1e2e" }, { prop: "border-radius", value: "8px" }, { prop: "color", value: "#cdd6f4" }, { prop: "padding", value: "20px" }] },
        { name: "text-accent", usageCount: 22, properties: [{ prop: "color", value: "#f59e0b" }, { prop: "font-size", value: "14px" }, { prop: "opacity", value: "0.95" }] },
        { name: "btn-glow", usageCount: 6, properties: [{ prop: "background-color", value: "#7c3aed" }, { prop: "border-radius", value: "24px" }, { prop: "box-shadow", value: "0 0 12px rgba(124,58,237,0.5)" }, { prop: "color", value: "#ffffff" }, { prop: "padding", value: "10px 24px" }] },
        { name: "surface-elevated", usageCount: 17, properties: [{ prop: "background-color", value: "#2a2a3c" }, { prop: "border-radius", value: "6px" }, { prop: "box-shadow", value: "0 4px 12px rgba(0,0,0,0.3)" }, { prop: "padding", value: "12px" }] },
        { name: "badge-live", usageCount: 3, properties: [{ prop: "background-color", value: "#ef4444" }, { prop: "border-radius", value: "999px" }, { prop: "color", value: "#ffffff" }, { prop: "font-size", value: "11px" }, { prop: "padding", value: "2px 8px" }] },
        { name: "panel-glass", usageCount: 8, properties: [{ prop: "background-color", value: "rgba(255,255,255,0.06)" }, { prop: "border-radius", value: "16px" }, { prop: "opacity", value: "0.9" }, { prop: "padding", value: "24px" }] }
    ]

    property int selectedClassIndex: 0
    property bool showAddClassDialog: false
    property bool showDeleteConfirm: false
    property string newClassName: ""

    property var propertySuggestions: [
        "color", "background-color", "border-radius", "padding",
        "font-size", "opacity", "box-shadow", "margin",
        "border", "font-weight", "text-align", "line-height"
    ]

    // ── Helpers ─────────────────────────────────────────────────────────
    function selectedClass() {
        if (selectedClassIndex >= 0 && selectedClassIndex < cssClasses.length) return cssClasses[selectedClassIndex]
        return null
    }

    function updateClasses(arr) { cssClasses = arr; if (useLiveData) saveCssClass(selectedClassIndex) }

    function addPropertyToSelected() {
        var cls = cssClasses.slice(); var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice(); props.push({ prop: "property", value: "value" })
        entry.properties = props; cls[selectedClassIndex] = entry; updateClasses(cls)
    }

    function removePropertyFromSelected(propIndex) {
        var cls = cssClasses.slice(); var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice(); props.splice(propIndex, 1)
        entry.properties = props; cls[selectedClassIndex] = entry; updateClasses(cls)
    }

    function setPropertyName(propIndex, name) {
        var cls = cssClasses.slice(); var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice(); props[propIndex] = { prop: name, value: props[propIndex].value }
        entry.properties = props; cls[selectedClassIndex] = entry; updateClasses(cls)
    }

    function setPropertyValue(propIndex, val) {
        var cls = cssClasses.slice(); var entry = Object.assign({}, cls[selectedClassIndex])
        var props = entry.properties.slice(); props[propIndex] = { prop: props[propIndex].prop, value: val }
        entry.properties = props; cls[selectedClassIndex] = entry; updateClasses(cls)
    }

    function setClassName(name) {
        var cls = cssClasses.slice(); var entry = Object.assign({}, cls[selectedClassIndex])
        entry.name = name; cls[selectedClassIndex] = entry; updateClasses(cls)
    }

    function addClass(name) {
        var newClass = { name: name, usageCount: 0, properties: [{ prop: "color", value: "#ffffff" }] }
        if (useLiveData) dbal.execute("core/css-classes/create", { data: newClass }, function(r, e) { if (!e) loadCssClasses() })
        var cls = cssClasses.slice(); cls.push(newClass); cssClasses = cls; selectedClassIndex = cls.length - 1
    }

    function deleteSelectedClass() {
        if (cssClasses.length <= 1) return
        if (useLiveData && cssClasses[selectedClassIndex].id) dbal.execute("core/css-classes/delete", { id: cssClasses[selectedClassIndex].id }, function(r, e) { if (!e) loadCssClasses() })
        var cls = cssClasses.slice(); cls.splice(selectedClassIndex, 1); cssClasses = cls
        if (selectedClassIndex >= cls.length) selectedClassIndex = cls.length - 1
    }

    // ── DBAL Integration ─────────────────────────────────────────────
    function loadCssClasses() {
        dbal.execute("core/css-classes", {}, function(result, error) {
            if (!error && result && result.items && result.items.length > 0) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var c = result.items[i]
                    parsed.push({ id: c.id, name: c.name || "", usageCount: c.usageCount || 0, properties: c.properties || [] })
                }
                cssClasses = parsed
                if (selectedClassIndex >= cssClasses.length) selectedClassIndex = cssClasses.length - 1
            }
        })
    }
    onUseLiveDataChanged: { if (useLiveData) loadCssClasses() }
    Component.onCompleted: { loadCssClasses() }

    function saveCssClass(index) {
        if (!useLiveData || index < 0 || index >= cssClasses.length) return
        var cls = cssClasses[index]
        var data = { name: cls.name, usageCount: cls.usageCount, properties: cls.properties }
        if (cls.id) dbal.execute("core/css-classes/update", { id: cls.id, data: data }, function(r, e) {})
        else dbal.execute("core/css-classes/create", { data: data }, function(r, e) { if (!e) loadCssClasses() })
    }

    // ── Layout ──────────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        spacing: 16
        anchors.margins: 20

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "CSS Class Manager" }
            Item { Layout.fillWidth: true }
            CBadge { text: cssClasses.length + " classes" }
            CButton { text: "Add Class"; variant: "primary"; size: "sm"; onClicked: { newClassName = ""; showAddClassDialog = true } }
        }

        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

            CssClassSidebar {
                Layout.preferredWidth: 280; Layout.fillHeight: true
                cssClasses: root.cssClasses
                selectedIndex: root.selectedClassIndex
                onItemClicked: function(idx) { root.selectedClassIndex = idx }
            }

            ColumnLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

                CssPropertyEditor {
                    Layout.fillWidth: true; Layout.fillHeight: true
                    visible: selectedClass() !== null
                    selectedClass: root.selectedClass()
                    propertySuggestions: root.propertySuggestions
                    onClassNameChanged: function(name) { setClassName(name) }
                    onDeleteClassClicked: showDeleteConfirm = true
                    onAddPropertyClicked: addPropertyToSelected()
                    onRemovePropertyClicked: function(idx) { removePropertyFromSelected(idx) }
                    onPropertyNameChanged: function(idx, name) { setPropertyName(idx, name) }
                    onPropertyValueChanged: function(idx, val) { setPropertyValue(idx, val) }
                }

                CssClassPreview {
                    Layout.fillWidth: true; Layout.preferredHeight: 160
                    visible: selectedClass() !== null
                    selectedClass: root.selectedClass()
                }
            }
        }
    }

    // ── Add Class Dialog ────────────────────────────────────────────────
    CDialog {
        visible: showAddClassDialog; title: "Add New Class"
        ColumnLayout {
            spacing: 16; width: 320
            CText { variant: "body1"; text: "Enter a name for the new CSS class." }
            CTextField { Layout.fillWidth: true; label: "Class Name"; placeholderText: "my-class"; text: newClassName; onTextChanged: newClassName = text }
            FlexRow {
                Layout.fillWidth: true; spacing: 8; Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; size: "sm"; onClicked: showAddClassDialog = false }
                CButton { text: "Create"; variant: "primary"; size: "sm"; enabled: newClassName.trim().length > 0; onClicked: { addClass(newClassName.trim()); showAddClassDialog = false } }
            }
        }
    }

    // ── Delete Confirmation Dialog ──────────────────────────────────────
    CDialog {
        visible: showDeleteConfirm; title: "Delete Class"
        ColumnLayout {
            spacing: 16; width: 320
            CAlert { Layout.fillWidth: true; severity: "warning"; text: selectedClass() ? "Are you sure you want to delete \"." + selectedClass().name + "\"? This action cannot be undone." : "No class selected." }
            CText { variant: "body2"; text: selectedClass() ? "This class is used in " + selectedClass().usageCount + " place(s)." : ""; visible: selectedClass() !== null && selectedClass().usageCount > 0 }
            FlexRow {
                Layout.fillWidth: true; spacing: 8; Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; size: "sm"; onClicked: showDeleteConfirm = false }
                CButton { text: "Delete"; variant: "danger"; size: "sm"; onClicked: { deleteSelectedClass(); showDeleteConfirm = false } }
            }
        }
    }
}

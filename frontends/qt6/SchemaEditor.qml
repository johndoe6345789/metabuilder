import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }

    // ── State ──────────────────────────────────────────────────────────
    property int selectedSchemaIndex: 0
    property int selectedFieldIndex: -1
    property bool createSchemaDialogOpen: false
    property bool addFieldDialogOpen: false
    property string newSchemaName: ""
    property string newSchemaDescription: ""
    property string newFieldName: ""
    property string newFieldType: "string"
    property bool newFieldRequired: false
    property string newFieldDefault: ""
    property string newFieldDescription: ""

    property var schemas: [
        { name: "User", description: "Core user accounts", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "username", type: "string", required: true, defaultValue: "", description: "Unique login name" }, { name: "email", type: "string", required: true, defaultValue: "", description: "Contact email" }, { name: "role", type: "enum", required: true, defaultValue: "user", description: "Access role (user/admin/moderator)" }, { name: "createdAt", type: "datetime", required: true, defaultValue: "now()", description: "Account creation timestamp" }] },
        { name: "Session", description: "Active user sessions", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Session token" }, { name: "userId", type: "string", required: true, defaultValue: "", description: "Owning user reference" }, { name: "expiresAt", type: "datetime", required: true, defaultValue: "", description: "Expiration timestamp" }, { name: "ipAddress", type: "string", required: false, defaultValue: "", description: "Client IP address" }] },
        { name: "Workflow", description: "DAG workflow definitions", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "name", type: "string", required: true, defaultValue: "", description: "Workflow display name" }, { name: "version", type: "string", required: true, defaultValue: "1.0.0", description: "Semver version" }, { name: "nodes", type: "json", required: true, defaultValue: "[]", description: "DAG node array" }, { name: "enabled", type: "boolean", required: true, defaultValue: "true", description: "Active toggle" }] },
        { name: "Package", description: "Installable feature packages", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "name", type: "string", required: true, defaultValue: "", description: "Package identifier" }, { name: "version", type: "string", required: true, defaultValue: "0.1.0", description: "Current version" }, { name: "size", type: "integer", required: false, defaultValue: "0", description: "Size in bytes" }, { name: "installed", type: "boolean", required: true, defaultValue: "false", description: "Installation state" }] },
        { name: "Forum", description: "Forum threads and posts", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "title", type: "string", required: true, defaultValue: "", description: "Thread title" }, { name: "body", type: "text", required: true, defaultValue: "", description: "Post content" }, { name: "authorId", type: "string", required: true, defaultValue: "", description: "Author user reference" }, { name: "pinned", type: "boolean", required: false, defaultValue: "false", description: "Pinned to top" }] },
        { name: "Notification", description: "User notification records", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "userId", type: "string", required: true, defaultValue: "", description: "Target user" }, { name: "message", type: "string", required: true, defaultValue: "", description: "Notification text" }, { name: "read", type: "boolean", required: true, defaultValue: "false", description: "Read status" }, { name: "channel", type: "enum", required: false, defaultValue: "in-app", description: "Delivery channel (in-app/email/push)" }] },
        { name: "AuditLog", description: "System audit trail", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "action", type: "string", required: true, defaultValue: "", description: "Action performed" }, { name: "entityType", type: "string", required: true, defaultValue: "", description: "Target entity type" }, { name: "entityId", type: "string", required: true, defaultValue: "", description: "Target entity ID" }, { name: "timestamp", type: "datetime", required: true, defaultValue: "now()", description: "When the action occurred" }, { name: "userId", type: "string", required: false, defaultValue: "", description: "Acting user" }] },
        { name: "Product", description: "E-commerce product catalog", fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }, { name: "name", type: "string", required: true, defaultValue: "", description: "Product name" }, { name: "price", type: "number", required: true, defaultValue: "0", description: "Price in cents" }, { name: "currency", type: "string", required: true, defaultValue: "USD", description: "ISO 4217 currency code" }, { name: "stock", type: "integer", required: false, defaultValue: "0", description: "Units in stock" }, { name: "active", type: "boolean", required: true, defaultValue: "true", description: "Listed for sale" }] }
    ]

    property var fieldTypes: ["string", "integer", "number", "boolean", "text", "json", "enum", "datetime", "date", "uuid", "array"]

    // ── DBAL Integration ─────────────────────────────────────────────
    function loadSchemas() {
        dbal.execute("core/schema", {}, function(result, error) {
            if (!error && result && result.items) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var item = result.items[i]; var fields = []
                    if (item.fields) {
                        for (var j = 0; j < item.fields.length; j++) {
                            var f = item.fields[j]
                            fields.push({ name: f.name || "", type: f.type || "string", required: f.required || false, defaultValue: f.defaultValue || f["default"] || "", description: f.description || "" })
                        }
                    }
                    parsed.push({ name: item.name || "", description: item.description || "", fields: fields })
                }
                if (parsed.length > 0) { schemas = parsed; selectedSchemaIndex = 0; selectedFieldIndex = -1 }
            }
        })
    }
    Component.onCompleted: { loadSchemas() }

    // ── Helpers ────────────────────────────────────────────────────────
    function currentSchema() { return schemas[selectedSchemaIndex] || null }
    function currentFields() { var s = currentSchema(); return s ? s.fields : [] }
    function currentField() { var fields = currentFields(); return (selectedFieldIndex >= 0 && selectedFieldIndex < fields.length) ? fields[selectedFieldIndex] : null }

    function updateField(key, value) {
        var copy = JSON.parse(JSON.stringify(schemas)); copy[selectedSchemaIndex].fields[selectedFieldIndex][key] = value; schemas = copy
    }

    function addSchema() {
        if (newSchemaName.trim() === "") return
        var schemaData = { name: newSchemaName.trim(), description: newSchemaDescription.trim(), fields: [{ name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }] }
        if (dbal.connected) {
            dbal.create("schema", schemaData, function(result, error) { if (!error) loadSchemas(); else addSchemaLocally(schemaData) })
        } else { addSchemaLocally(schemaData) }
        newSchemaName = ""; newSchemaDescription = ""; createSchemaDialogOpen = false
    }

    function addSchemaLocally(schemaData) {
        var copy = JSON.parse(JSON.stringify(schemas)); copy.push(schemaData); schemas = copy
        selectedSchemaIndex = copy.length - 1; selectedFieldIndex = -1
    }

    function deleteSchema() {
        if (schemas.length <= 1) return
        var copy = JSON.parse(JSON.stringify(schemas)); copy.splice(selectedSchemaIndex, 1); schemas = copy
        if (selectedSchemaIndex >= copy.length) selectedSchemaIndex = copy.length - 1; selectedFieldIndex = -1
    }

    function addField() {
        if (newFieldName.trim() === "") return
        var copy = JSON.parse(JSON.stringify(schemas))
        copy[selectedSchemaIndex].fields.push({ name: newFieldName.trim(), type: newFieldType, required: newFieldRequired, defaultValue: newFieldDefault, description: newFieldDescription })
        schemas = copy; selectedFieldIndex = copy[selectedSchemaIndex].fields.length - 1
        newFieldName = ""; newFieldType = "string"; newFieldRequired = false; newFieldDefault = ""; newFieldDescription = ""; addFieldDialogOpen = false
    }

    function deleteField() {
        if (selectedFieldIndex < 0) return
        var copy = JSON.parse(JSON.stringify(schemas)); copy[selectedSchemaIndex].fields.splice(selectedFieldIndex, 1)
        schemas = copy; selectedFieldIndex = -1
    }

    // ── Layout ─────────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 0

        FlexRow {
            Layout.fillWidth: true; Layout.bottomMargin: 16; spacing: 12
            CText { variant: "h3"; text: "Schema Editor" }
            Item { Layout.fillWidth: true }
            CBadge { text: currentSchema() ? currentSchema().name : ""; accent: true; visible: currentSchema() !== null }
            CBadge { text: currentFields().length + " fields"; visible: currentSchema() !== null }
            CButton { text: "Create Schema"; variant: "primary"; size: "md"; onClicked: createSchemaDialogOpen = true }
        }

        CDivider { Layout.fillWidth: true; Layout.bottomMargin: 16 }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

            SchemaSidebar {
                Layout.preferredWidth: 240; Layout.fillHeight: true
                schemas: root.schemas
                selectedIndex: root.selectedSchemaIndex
                onItemClicked: function(idx) { selectedSchemaIndex = idx; selectedFieldIndex = -1 }
            }

            SchemaFieldsTable {
                Layout.fillWidth: true; Layout.fillHeight: true
                schema: currentSchema()
                fields: currentFields()
                selectedFieldIndex: root.selectedFieldIndex
                onFieldClicked: function(idx) { selectedFieldIndex = idx }
                onAddFieldClicked: addFieldDialogOpen = true
                onRemoveFieldClicked: deleteField()
            }

            SchemaFieldEditor {
                Layout.preferredWidth: 280; Layout.fillHeight: true
                visible: selectedFieldIndex >= 0
                field: currentField()
                fieldTypes: root.fieldTypes
                onFieldUpdated: function(key, value) { updateField(key, value) }
            }
        }

        CDivider { Layout.fillWidth: true; Layout.topMargin: 16 }

        FlexRow {
            Layout.fillWidth: true; Layout.topMargin: 12; spacing: 12
            CButton { text: "Save Schema"; variant: "primary"; size: "md" }
            CButton { text: "Export JSON"; variant: "secondary"; size: "md" }
            Item { Layout.fillWidth: true }
            CButton { text: "Delete Schema"; variant: "danger"; size: "md"; enabled: schemas.length > 1; onClicked: deleteSchema() }
        }
    }

    // ── Create Schema Dialog ───────────────────────────────────────────
    CDialog {
        visible: createSchemaDialogOpen; title: "Create New Schema"
        ColumnLayout {
            spacing: 16; width: 360
            CTextField { label: "Schema Name"; placeholderText: "e.g. Invoice"; text: newSchemaName; Layout.fillWidth: true; onTextChanged: newSchemaName = text }
            CTextField { label: "Description"; placeholderText: "Brief description of this schema"; text: newSchemaDescription; Layout.fillWidth: true; onTextChanged: newSchemaDescription = text }
            FlexRow {
                Layout.fillWidth: true; spacing: 12; Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; onClicked: { newSchemaName = ""; newSchemaDescription = ""; createSchemaDialogOpen = false } }
                CButton { text: "Create"; variant: "primary"; enabled: newSchemaName.trim() !== ""; onClicked: addSchema() }
            }
        }
    }

    // ── Add Field Dialog ───────────────────────────────────────────────
    CDialog {
        visible: addFieldDialogOpen; title: "Add New Field"
        ColumnLayout {
            spacing: 14; width: 360
            CTextField { label: "Field Name"; placeholderText: "e.g. quantity"; text: newFieldName; Layout.fillWidth: true; onTextChanged: newFieldName = text }
            ColumnLayout {
                Layout.fillWidth: true; spacing: 4
                CText { variant: "caption"; text: "Type" }
                CSelect { model: fieldTypes; currentIndex: fieldTypes.indexOf(newFieldType); Layout.fillWidth: true; onCurrentIndexChanged: newFieldType = fieldTypes[currentIndex] }
            }
            CSwitch { text: "Required"; checked: newFieldRequired; onCheckedChanged: newFieldRequired = checked }
            CTextField { label: "Default Value"; placeholderText: "Optional default"; text: newFieldDefault; Layout.fillWidth: true; onTextChanged: newFieldDefault = text }
            CTextField { label: "Description"; placeholderText: "What this field represents"; text: newFieldDescription; Layout.fillWidth: true; onTextChanged: newFieldDescription = text }
            FlexRow {
                Layout.fillWidth: true; spacing: 12; Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; onClicked: { newFieldName = ""; newFieldType = "string"; newFieldRequired = false; newFieldDefault = ""; newFieldDescription = ""; addFieldDialogOpen = false } }
                CButton { text: "Add Field"; variant: "primary"; enabled: newFieldName.trim() !== ""; onClicked: addField() }
            }
        }
    }
}

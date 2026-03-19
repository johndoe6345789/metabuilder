import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

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
        {
            name: "User", description: "Core user accounts",
            fields: [
                { name: "id",        type: "string",   required: true,  defaultValue: "uuid()",    description: "Primary key" },
                { name: "username",  type: "string",   required: true,  defaultValue: "",          description: "Unique login name" },
                { name: "email",     type: "string",   required: true,  defaultValue: "",          description: "Contact email" },
                { name: "role",      type: "enum",     required: true,  defaultValue: "user",      description: "Access role (user/admin/moderator)" },
                { name: "createdAt", type: "datetime", required: true,  defaultValue: "now()",     description: "Account creation timestamp" }
            ]
        },
        {
            name: "Session", description: "Active user sessions",
            fields: [
                { name: "id",        type: "string",   required: true,  defaultValue: "uuid()",    description: "Session token" },
                { name: "userId",    type: "string",   required: true,  defaultValue: "",          description: "Owning user reference" },
                { name: "expiresAt", type: "datetime", required: true,  defaultValue: "",          description: "Expiration timestamp" },
                { name: "ipAddress", type: "string",   required: false, defaultValue: "",          description: "Client IP address" }
            ]
        },
        {
            name: "Workflow", description: "DAG workflow definitions",
            fields: [
                { name: "id",          type: "string",  required: true,  defaultValue: "uuid()",  description: "Primary key" },
                { name: "name",        type: "string",  required: true,  defaultValue: "",         description: "Workflow display name" },
                { name: "version",     type: "string",  required: true,  defaultValue: "1.0.0",   description: "Semver version" },
                { name: "nodes",       type: "json",    required: true,  defaultValue: "[]",       description: "DAG node array" },
                { name: "enabled",     type: "boolean", required: true,  defaultValue: "true",     description: "Active toggle" }
            ]
        },
        {
            name: "Package", description: "Installable feature packages",
            fields: [
                { name: "id",          type: "string",  required: true,  defaultValue: "uuid()",  description: "Primary key" },
                { name: "name",        type: "string",  required: true,  defaultValue: "",         description: "Package identifier" },
                { name: "version",     type: "string",  required: true,  defaultValue: "0.1.0",   description: "Current version" },
                { name: "size",        type: "integer", required: false, defaultValue: "0",        description: "Size in bytes" },
                { name: "installed",   type: "boolean", required: true,  defaultValue: "false",    description: "Installation state" }
            ]
        },
        {
            name: "Forum", description: "Forum threads and posts",
            fields: [
                { name: "id",        type: "string",   required: true,  defaultValue: "uuid()",  description: "Primary key" },
                { name: "title",     type: "string",   required: true,  defaultValue: "",         description: "Thread title" },
                { name: "body",      type: "text",     required: true,  defaultValue: "",         description: "Post content" },
                { name: "authorId",  type: "string",   required: true,  defaultValue: "",         description: "Author user reference" },
                { name: "pinned",    type: "boolean",  required: false, defaultValue: "false",    description: "Pinned to top" }
            ]
        },
        {
            name: "Notification", description: "User notification records",
            fields: [
                { name: "id",        type: "string",   required: true,  defaultValue: "uuid()",  description: "Primary key" },
                { name: "userId",    type: "string",   required: true,  defaultValue: "",         description: "Target user" },
                { name: "message",   type: "string",   required: true,  defaultValue: "",         description: "Notification text" },
                { name: "read",      type: "boolean",  required: true,  defaultValue: "false",    description: "Read status" },
                { name: "channel",   type: "enum",     required: false, defaultValue: "in-app",   description: "Delivery channel (in-app/email/push)" }
            ]
        },
        {
            name: "AuditLog", description: "System audit trail",
            fields: [
                { name: "id",        type: "string",   required: true,  defaultValue: "uuid()",  description: "Primary key" },
                { name: "action",    type: "string",   required: true,  defaultValue: "",         description: "Action performed" },
                { name: "entityType",type: "string",   required: true,  defaultValue: "",         description: "Target entity type" },
                { name: "entityId",  type: "string",   required: true,  defaultValue: "",         description: "Target entity ID" },
                { name: "timestamp", type: "datetime", required: true,  defaultValue: "now()",    description: "When the action occurred" },
                { name: "userId",    type: "string",   required: false, defaultValue: "",         description: "Acting user" }
            ]
        },
        {
            name: "Product", description: "E-commerce product catalog",
            fields: [
                { name: "id",        type: "string",   required: true,  defaultValue: "uuid()",  description: "Primary key" },
                { name: "name",      type: "string",   required: true,  defaultValue: "",         description: "Product name" },
                { name: "price",     type: "number",   required: true,  defaultValue: "0",        description: "Price in cents" },
                { name: "currency",  type: "string",   required: true,  defaultValue: "USD",      description: "ISO 4217 currency code" },
                { name: "stock",     type: "integer",  required: false, defaultValue: "0",        description: "Units in stock" },
                { name: "active",    type: "boolean",  required: true,  defaultValue: "true",     description: "Listed for sale" }
            ]
        }
    ]

    property var fieldTypes: ["string", "integer", "number", "boolean", "text", "json", "enum", "datetime", "date", "uuid", "array"]

    property var mockSchemas: JSON.parse(JSON.stringify(schemas))

    // ── DBAL Integration ─────────────────────────────────────────────

    function loadSchemas() {
        dbal.execute("core/schema", {}, function(result, error) {
            if (!error && result && result.items) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var item = result.items[i]
                    var fields = []
                    if (item.fields) {
                        for (var j = 0; j < item.fields.length; j++) {
                            var f = item.fields[j]
                            fields.push({
                                name: f.name || "",
                                type: f.type || "string",
                                required: f.required || false,
                                defaultValue: f.defaultValue || f["default"] || "",
                                description: f.description || ""
                            })
                        }
                    }
                    parsed.push({
                        name: item.name || "",
                        description: item.description || "",
                        fields: fields
                    })
                }
                if (parsed.length > 0) {
                    schemas = parsed
                    selectedSchemaIndex = 0
                    selectedFieldIndex = -1
                }
                // If parsed is empty, keep existing mock schemas as fallback
            }
            // On error, keep existing mock schemas as fallback
        })
    }

    Component.onCompleted: {
        loadSchemas()
    }

    // ── Helpers ────────────────────────────────────────────────────────

    function currentSchema() {
        return schemas[selectedSchemaIndex] || null
    }

    function currentFields() {
        var s = currentSchema()
        return s ? s.fields : []
    }

    function currentField() {
        var fields = currentFields()
        if (selectedFieldIndex >= 0 && selectedFieldIndex < fields.length)
            return fields[selectedFieldIndex]
        return null
    }

    function updateField(key, value) {
        var copy = JSON.parse(JSON.stringify(schemas))
        copy[selectedSchemaIndex].fields[selectedFieldIndex][key] = value
        schemas = copy
    }

    function addSchema() {
        if (newSchemaName.trim() === "") return
        var schemaData = {
            name: newSchemaName.trim(),
            description: newSchemaDescription.trim(),
            fields: [
                { name: "id", type: "string", required: true, defaultValue: "uuid()", description: "Primary key" }
            ]
        }

        // POST to DBAL when connected, then update local state
        if (dbal.connected) {
            dbal.create("schema", schemaData, function(result, error) {
                if (!error) {
                    // Reload from server to stay in sync
                    loadSchemas()
                } else {
                    // Fallback: add locally
                    addSchemaLocally(schemaData)
                }
            })
        } else {
            addSchemaLocally(schemaData)
        }

        newSchemaName = ""
        newSchemaDescription = ""
        createSchemaDialogOpen = false
    }

    function addSchemaLocally(schemaData) {
        var copy = JSON.parse(JSON.stringify(schemas))
        copy.push(schemaData)
        schemas = copy
        selectedSchemaIndex = copy.length - 1
        selectedFieldIndex = -1
    }

    function deleteSchema() {
        if (schemas.length <= 1) return
        var copy = JSON.parse(JSON.stringify(schemas))
        copy.splice(selectedSchemaIndex, 1)
        schemas = copy
        if (selectedSchemaIndex >= copy.length)
            selectedSchemaIndex = copy.length - 1
        selectedFieldIndex = -1
    }

    function addField() {
        if (newFieldName.trim() === "") return
        var copy = JSON.parse(JSON.stringify(schemas))
        copy[selectedSchemaIndex].fields.push({
            name: newFieldName.trim(),
            type: newFieldType,
            required: newFieldRequired,
            defaultValue: newFieldDefault,
            description: newFieldDescription
        })
        schemas = copy
        selectedFieldIndex = copy[selectedSchemaIndex].fields.length - 1
        newFieldName = ""
        newFieldType = "string"
        newFieldRequired = false
        newFieldDefault = ""
        newFieldDescription = ""
        addFieldDialogOpen = false
    }

    function deleteField() {
        if (selectedFieldIndex < 0) return
        var copy = JSON.parse(JSON.stringify(schemas))
        copy[selectedSchemaIndex].fields.splice(selectedFieldIndex, 1)
        schemas = copy
        selectedFieldIndex = -1
    }

    // ── Layout ─────────────────────────────────────────────────────────

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 0

        // ── Top bar ────────────────────────────────────────────────────

        FlexRow {
            Layout.fillWidth: true
            Layout.bottomMargin: 16
            spacing: 12

            CText { variant: "h3"; text: "Schema Editor" }
            Item { Layout.fillWidth: true }

            CBadge {
                text: currentSchema() ? currentSchema().name : ""
                accent: true
                visible: currentSchema() !== null
            }
            CBadge {
                text: currentFields().length + " fields"
                visible: currentSchema() !== null
            }

            CButton {
                text: "Create Schema"
                variant: "primary"
                size: "md"
                onClicked: createSchemaDialogOpen = true
            }
        }

        CDivider { Layout.fillWidth: true; Layout.bottomMargin: 16 }

        // ── Main content row ───────────────────────────────────────────

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // ── LEFT: Schema list sidebar ──────────────────────────────

            CCard {
                Layout.preferredWidth: 240
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 10

                    CText { variant: "subtitle1"; text: "Schemas" }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: schemas
                        spacing: 4
                        clip: true
                        delegate: CListItem {
                            width: parent ? parent.width : 200
                            title: modelData.name
                            subtitle: modelData.fields.length + " fields"
                            selected: index === selectedSchemaIndex
                            leadingIcon: "schema"
                            onClicked: {
                                selectedSchemaIndex = index
                                selectedFieldIndex = -1
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    CText {
                        variant: "caption"
                        text: schemas.length + " schemas total"
                        color: Theme.border
                    }
                }
            }

            // ── CENTER: Fields table ───────────────────────────────────

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CText {
                            variant: "h4"
                            text: currentSchema() ? currentSchema().name + " Fields" : "No Schema Selected"
                        }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Add Field"
                            variant: "primary"
                            size: "sm"
                            onClicked: addFieldDialogOpen = true
                            visible: currentSchema() !== null
                        }
                        CButton {
                            text: "Remove Field"
                            variant: "danger"
                            size: "sm"
                            enabled: selectedFieldIndex >= 0
                            visible: currentSchema() !== null
                            onClicked: deleteField()
                        }
                    }

                    // Table header
                    Rectangle {
                        Layout.fillWidth: true
                        height: 36
                        color: Theme.surface
                        radius: 4

                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12
                            anchors.rightMargin: 12
                            spacing: 8

                            CText { variant: "caption"; text: "NAME";     Layout.preferredWidth: 140; font.bold: true }
                            CText { variant: "caption"; text: "TYPE";     Layout.preferredWidth: 100; font.bold: true }
                            CText { variant: "caption"; text: "REQUIRED"; Layout.preferredWidth: 80;  font.bold: true }
                            CText { variant: "caption"; text: "DEFAULT";  Layout.fillWidth: true;     font.bold: true }
                        }
                    }

                    // Table rows
                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: currentFields()
                        spacing: 2
                        clip: true

                        delegate: Rectangle {
                            width: parent ? parent.width : 400
                            height: 40
                            radius: 4
                            color: index === selectedFieldIndex ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12)
                                                                 : (fieldMouse.containsMouse ? Theme.surface : "transparent")

                            MouseArea {
                                id: fieldMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                onClicked: selectedFieldIndex = index
                            }

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12
                                anchors.rightMargin: 12
                                spacing: 8

                                CText {
                                    variant: "body2"
                                    text: modelData.name
                                    Layout.preferredWidth: 140
                                    font.bold: index === selectedFieldIndex
                                }
                                CChip {
                                    text: modelData.type
                                    Layout.preferredWidth: 100
                                }
                                CText {
                                    variant: "body2"
                                    text: modelData.required ? "Yes" : "No"
                                    color: modelData.required ? Theme.primary : Theme.border
                                    Layout.preferredWidth: 80
                                }
                                CText {
                                    variant: "caption"
                                    text: modelData.defaultValue || "-"
                                    Layout.fillWidth: true
                                    elide: Text.ElideRight
                                }
                            }
                        }
                    }

                    // Schema description
                    CDivider { Layout.fillWidth: true }

                    CText {
                        variant: "caption"
                        text: currentSchema() ? currentSchema().description : ""
                        color: Theme.border
                    }
                }
            }

            // ── RIGHT: Field editor panel ──────────────────────────────

            CCard {
                Layout.preferredWidth: 280
                Layout.fillHeight: true
                visible: selectedFieldIndex >= 0

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 14

                    CText { variant: "subtitle1"; text: "Field Editor" }
                    CDivider { Layout.fillWidth: true }

                    CTextField {
                        label: "Field Name"
                        placeholderText: "e.g. username"
                        text: currentField() ? currentField().name : ""
                        Layout.fillWidth: true
                        onTextChanged: {
                            if (currentField() && text !== currentField().name)
                                updateField("name", text)
                        }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        CText { variant: "caption"; text: "Type" }
                        CSelect {
                            model: fieldTypes
                            currentIndex: {
                                if (!currentField()) return 0
                                var idx = fieldTypes.indexOf(currentField().type)
                                return idx >= 0 ? idx : 0
                            }
                            Layout.fillWidth: true
                            onCurrentIndexChanged: {
                                if (currentField() && fieldTypes[currentIndex] !== currentField().type)
                                    updateField("type", fieldTypes[currentIndex])
                            }
                        }
                    }

                    CSwitch {
                        text: "Required"
                        checked: currentField() ? currentField().required : false
                        onCheckedChanged: {
                            if (currentField() && checked !== currentField().required)
                                updateField("required", checked)
                        }
                    }

                    CTextField {
                        label: "Default Value"
                        placeholderText: "e.g. uuid()"
                        text: currentField() ? currentField().defaultValue : ""
                        Layout.fillWidth: true
                        onTextChanged: {
                            if (currentField() && text !== currentField().defaultValue)
                                updateField("defaultValue", text)
                        }
                    }

                    CTextField {
                        label: "Description"
                        placeholderText: "Field description"
                        text: currentField() ? currentField().description : ""
                        Layout.fillWidth: true
                        onTextChanged: {
                            if (currentField() && text !== currentField().description)
                                updateField("description", text)
                        }
                    }

                    Item { Layout.fillHeight: true }

                    CAlert {
                        severity: "info"
                        text: "Editing: " + (currentField() ? currentField().name : "")
                        Layout.fillWidth: true
                    }
                }
            }
        }

        // ── Bottom action bar ──────────────────────────────────────────

        CDivider { Layout.fillWidth: true; Layout.topMargin: 16 }

        FlexRow {
            Layout.fillWidth: true
            Layout.topMargin: 12
            spacing: 12

            CButton { text: "Save Schema";   variant: "primary"; size: "md" }
            CButton { text: "Export JSON";    variant: "secondary"; size: "md" }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Delete Schema"
                variant: "danger"
                size: "md"
                enabled: schemas.length > 1
                onClicked: deleteSchema()
            }
        }
    }

    // ── Create Schema Dialog ───────────────────────────────────────────

    CDialog {
        id: createSchemaDialog
        visible: createSchemaDialogOpen
        title: "Create New Schema"

        ColumnLayout {
            spacing: 16
            width: 360

            CTextField {
                label: "Schema Name"
                placeholderText: "e.g. Invoice"
                text: newSchemaName
                Layout.fillWidth: true
                onTextChanged: newSchemaName = text
            }

            CTextField {
                label: "Description"
                placeholderText: "Brief description of this schema"
                text: newSchemaDescription
                Layout.fillWidth: true
                onTextChanged: newSchemaDescription = text
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: {
                        newSchemaName = ""
                        newSchemaDescription = ""
                        createSchemaDialogOpen = false
                    }
                }
                CButton {
                    text: "Create"
                    variant: "primary"
                    enabled: newSchemaName.trim() !== ""
                    onClicked: addSchema()
                }
            }
        }
    }

    // ── Add Field Dialog ───────────────────────────────────────────────

    CDialog {
        id: addFieldDialog
        visible: addFieldDialogOpen
        title: "Add New Field"

        ColumnLayout {
            spacing: 14
            width: 360

            CTextField {
                label: "Field Name"
                placeholderText: "e.g. quantity"
                text: newFieldName
                Layout.fillWidth: true
                onTextChanged: newFieldName = text
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4
                CText { variant: "caption"; text: "Type" }
                CSelect {
                    model: fieldTypes
                    currentIndex: fieldTypes.indexOf(newFieldType)
                    Layout.fillWidth: true
                    onCurrentIndexChanged: newFieldType = fieldTypes[currentIndex]
                }
            }

            CSwitch {
                text: "Required"
                checked: newFieldRequired
                onCheckedChanged: newFieldRequired = checked
            }

            CTextField {
                label: "Default Value"
                placeholderText: "Optional default"
                text: newFieldDefault
                Layout.fillWidth: true
                onTextChanged: newFieldDefault = text
            }

            CTextField {
                label: "Description"
                placeholderText: "What this field represents"
                text: newFieldDescription
                Layout.fillWidth: true
                onTextChanged: newFieldDescription = text
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: {
                        newFieldName = ""
                        newFieldType = "string"
                        newFieldRequired = false
                        newFieldDefault = ""
                        newFieldDescription = ""
                        addFieldDialogOpen = false
                    }
                }
                CButton {
                    text: "Add Field"
                    variant: "primary"
                    enabled: newFieldName.trim() !== ""
                    onClicked: addField()
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/SchemaEditorDBAL.js" as SDBAL

Rectangle {
    color: Theme.background

    DBALProvider { id: dbal }
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
    property var schemas: SDBAL.loadJson(Qt.resolvedUrl("qmllib/MetaBuilder/data/schema-mock.json"))
    property var fieldTypes: ["string", "integer", "number", "boolean", "text", "json", "enum", "datetime", "date", "uuid", "array"]

    function loadSchemas() { SDBAL.loadSchemas(dbal, function(parsed) { schemas = parsed; selectedSchemaIndex = 0; selectedFieldIndex = -1 }) }
    Component.onCompleted: { loadSchemas() }

    function addSchema() {
        var r = SDBAL.addSchema(schemas, newSchemaName, newSchemaDescription, dbal, loadSchemas)
        if (r) { schemas = r.schemas; selectedSchemaIndex = r.selectedIndex; selectedFieldIndex = -1 }
        newSchemaName = ""; newSchemaDescription = ""; createSchemaDialogOpen = false
    }
    function addField() {
        var r = SDBAL.addField(schemas, selectedSchemaIndex, { name: newFieldName, type: newFieldType, required: newFieldRequired, defaultValue: newFieldDefault, description: newFieldDescription })
        if (r) { schemas = r.schemas; selectedFieldIndex = r.selectedFieldIndex }
        newFieldName = ""; newFieldType = "string"; newFieldRequired = false; newFieldDefault = ""; newFieldDescription = ""; addFieldDialogOpen = false
    }
    function deleteSchema() {
        var r = SDBAL.deleteSchema(schemas, selectedSchemaIndex)
        if (r) { schemas = r.schemas; selectedSchemaIndex = r.selectedIndex; selectedFieldIndex = -1 }
    }

    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 0
        FlexRow {
            Layout.fillWidth: true; Layout.bottomMargin: 16; spacing: 12
            CText { variant: "h3"; text: "Schema Editor" }
            Item { Layout.fillWidth: true }
            CBadge { text: SDBAL.currentSchema(schemas, selectedSchemaIndex) ? SDBAL.currentSchema(schemas, selectedSchemaIndex).name : ""; accent: true; visible: SDBAL.currentSchema(schemas, selectedSchemaIndex) !== null }
            CBadge { text: SDBAL.currentFields(schemas, selectedSchemaIndex).length + " fields"; visible: SDBAL.currentSchema(schemas, selectedSchemaIndex) !== null }
            CButton { text: "Create Schema"; variant: "primary"; size: "md"; onClicked: createSchemaDialogOpen = true }
        }
        CDivider { Layout.fillWidth: true; Layout.bottomMargin: 16 }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
            SchemaSidebar { Layout.preferredWidth: 240; Layout.fillHeight: true; schemas: root.schemas; selectedIndex: root.selectedSchemaIndex; onItemClicked: function(idx) { selectedSchemaIndex = idx; selectedFieldIndex = -1 } }
            SchemaFieldsTable { Layout.fillWidth: true; Layout.fillHeight: true; schema: SDBAL.currentSchema(schemas, selectedSchemaIndex); fields: SDBAL.currentFields(schemas, selectedSchemaIndex); selectedFieldIndex: root.selectedFieldIndex; onFieldClicked: function(idx) { selectedFieldIndex = idx }; onAddFieldClicked: addFieldDialogOpen = true; onRemoveFieldClicked: { schemas = SDBAL.deleteField(schemas, selectedSchemaIndex, selectedFieldIndex); selectedFieldIndex = -1 } }
            SchemaFieldEditor { Layout.preferredWidth: 280; Layout.fillHeight: true; visible: selectedFieldIndex >= 0; field: SDBAL.currentField(schemas, selectedSchemaIndex, selectedFieldIndex); fieldTypes: root.fieldTypes; onFieldUpdated: function(key, value) { schemas = SDBAL.updateField(schemas, selectedSchemaIndex, selectedFieldIndex, key, value) } }
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

    CDialog {
        visible: createSchemaDialogOpen; title: "Create New Schema"
        ColumnLayout {
            spacing: 16; width: 360
            CTextField { label: "Schema Name"; placeholderText: "e.g. Invoice"; text: newSchemaName; Layout.fillWidth: true; onTextChanged: newSchemaName = text }
            CTextField { label: "Description"; placeholderText: "Brief description of this schema"; text: newSchemaDescription; Layout.fillWidth: true; onTextChanged: newSchemaDescription = text }
            FlexRow {
                Layout.fillWidth: true; spacing: 12
                Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; onClicked: { newSchemaName = ""; newSchemaDescription = ""; createSchemaDialogOpen = false } }
                CButton { text: "Create"; variant: "primary"; enabled: newSchemaName.trim() !== ""; onClicked: addSchema() }
            }
        }
    }

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
                Layout.fillWidth: true; spacing: 12
                Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; onClicked: { newFieldName = ""; newFieldType = "string"; newFieldRequired = false; newFieldDefault = ""; newFieldDescription = ""; addFieldDialogOpen = false } }
                CButton { text: "Add Field"; variant: "primary"; enabled: newFieldName.trim() !== ""; onClicked: addField() }
            }
        }
    }
}

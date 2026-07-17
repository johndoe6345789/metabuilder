import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "qmllib/dbal"; import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/SchemaEditorDBAL.js" as SDBAL
Rectangle {
    id: root; color: Theme.background
    objectName: "view_schema_editor"
    Accessible.role: Accessible.Pane
    Accessible.name: "Schema Editor"
    DBALProvider { id: dbal }
    property int selSch: 0; property int selFld: -1
    property bool createDlg: false; property bool addFldDlg: false
    property string nfName: ""; property string nfType: "string"
    property bool nfR: false; property string nfDv: ""; property string nfDc: ""
    property var schemas: SDBAL.loadJson(Qt.resolvedUrl(
        "qmllib/MetaBuilder/data/schema-mock.json")) || []
    property var fieldTypes: ["string","integer","number",
        "boolean","text","json","enum","datetime","date","uuid","array"]
    function cs() { return SDBAL.currentSchema(schemas, selSch) }
    function cf() { return SDBAL.currentFields(schemas, selSch) }
    function loadSchemas() {
        SDBAL.loadSchemas(dbal, function(p) {
            schemas = p || []; selSch = 0; selFld = -1 })
    }
    Component.onCompleted: loadSchemas()
    function addField() {
        var f = { name: nfName, type: nfType, required: nfR,
            defaultValue: nfDv, description: nfDc }
        var r = SDBAL.addField(schemas, selSch, f)
        if (r) { schemas = r.schemas; selFld = r.selectedFieldIndex }
        nfName = ""; nfType = "string"; nfR = false
        nfDv = ""; nfDc = ""; addFldDlg = false }
    function deleteSchema() {
        var r = SDBAL.deleteSchema(schemas, selSch)
        if (r) { schemas = r.schemas; selSch = r.selectedIndex; selFld = -1 }
    }
    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 0
        FlexRow {
            Layout.fillWidth: true; Layout.bottomMargin: 16; spacing: 12
            CText { variant: "h3"; text: "Schema Editor" }
            Item { Layout.fillWidth: true }
            CBadge { text: cs() ? cs().name : "";
                accent: true; visible: cs() !== null }
            CBadge { text: cf().length + " fields"; visible: cs() !== null }
            CButton { text: "Create Schema";
                variant: "primary"; size: "md";
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Create Schema"
                Keys.onReturnPressed: createDlg = true
                Keys.onSpacePressed: createDlg = true
                onClicked: createDlg = true }
        }
        CDivider { Layout.fillWidth: true; Layout.bottomMargin: 16 }
        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
            SchemaSidebar {
                Layout.preferredWidth: 240; Layout.fillHeight: true
                schemas: root.schemas; selectedIndex: root.selSch
                onItemClicked: function(i) { selSch = i; selFld = -1 }
            }
            SchemaFieldsTable {
                Layout.fillWidth: true; Layout.fillHeight: true
                schema: cs(); fields: cf(); selectedFieldIndex: root.selFld
                onFieldClicked: function(i) { selFld = i }
                onAddFieldClicked: addFldDlg = true
                onRemoveFieldClicked: {
                    schemas = SDBAL.deleteField(
                        schemas, selSch, selFld)
                    selFld = -1 }
            }
            SchemaFieldEditor {
                Layout.preferredWidth: 280
                Layout.fillHeight: true; visible: selFld >= 0
                field: SDBAL.currentField(schemas, selSch, selFld)
                fieldTypes: root.fieldTypes; onFieldUpdated: function(k, v) {
                    schemas = SDBAL.updateField(schemas, selSch, selFld, k, v) }
            }
        }
        CDivider { Layout.fillWidth: true; Layout.topMargin: 16 }
        FlexRow {
            Layout.fillWidth: true
            Layout.topMargin: 12; spacing: 12
            CButton {
                text: "Save Schema"
                variant: "primary"; size: "md"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Save Schema"
            }
            CButton {
                text: "Export JSON"
                variant: "secondary"; size: "md"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Export JSON"
                Accessible.description:
                    "Export schema as JSON"
            }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Delete Schema"
                variant: "danger"; size: "md"
                enabled: schemas.length > 1
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Delete Schema"
                Accessible.description:
                    "Delete the current schema"
                Keys.onReturnPressed: deleteSchema()
                Keys.onSpacePressed: deleteSchema()
                onClicked: deleteSchema()
            }
        }
    }
    CCreateSchemaDialog {
        visible: createDlg; onCancelled: createDlg = false
        onCreateRequested: function(n, d) {
            var r = SDBAL.addSchema(schemas, n, d, dbal, loadSchemas)
            if (r) { schemas = r.schemas;
                selSch = r.selectedIndex; selFld = -1 }
            createDlg = false }
    }
    CAddFieldDialog {
        visible: addFldDlg; fieldTypes: root.fieldTypes
        onFieldAdded: function(f) {
            nfName = f.name; nfType = f.type; nfR = f.required
            nfDv = f.defaultValue; nfDc = f.description; addField() }
        onCancelled: addFldDlg = false
    }
}

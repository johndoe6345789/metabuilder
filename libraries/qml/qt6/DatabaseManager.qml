import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "qmllib/dbal"; import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/DatabaseLogic.js" as Logic
Rectangle {
    id: root; color: Theme.background
    objectName: "view_database_manager"
    Accessible.role: Accessible.Pane
    Accessible.name: "Database Manager"
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property int selBk: 2; property int actBk: 2; property int adPat: 0
    property string dbUrl: "sqlite:///var/lib/dbal/metabuilder.db"
    property string cacheUrl:
        "redis://localhost:6379/0?ttl=300&pattern=read-through"
    property string searchUrl:
        "http://localhost:9200?index=dbal_search&refresh=true"
    property bool showExpDlg: false; property bool showImpDlg: false
    property var adPats: []; property var backends: []
    property var testIdx: -1; property var testRes: ({})
    function loadSeedData() {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(
            "config/database-backends.json"), false)
        xhr.send()
        if (xhr.status === 200) {
            var d = JSON.parse(xhr.responseText)
            backends = d.backends; adPats = d.adapterPatterns }
    }
    Timer {
        id: testTimer; property int tgt: -1; interval: 1500
        onTriggered: {
            var b = backends[tgt]
            var r = b.status === "connected" ? "success"
                : (b.status === "error" ? "error" : "warning")
            var nr = Object.assign({}, testRes)
            nr[tgt] = r; testRes = nr; testIdx = -1 }
    }
    onUseLiveDataChanged: {
        if (useLiveData) Logic.loadAdapterStatus(root, dbal) }
    Component.onCompleted: {
        loadSeedData(); Logic.loadAdapterStatus(root, dbal) }
    Dialog {
        id: expDlg; visible: showExpDlg; title: "Export Database"
        modal: true; anchors.centerIn: parent; width: 420
        standardButtons: Dialog.Ok | Dialog.Cancel
        onAccepted: showExpDlg = false; onRejected: showExpDlg = false
        ColumnLayout {
            spacing: 12; width: parent.width
            CText { variant: "body1"
                text: "Export the active database ("
                    + backends[actBk].name + ") to a JSON dump file." }
            CTextField { label: "Output path"
                text: "/tmp/dbal-export-"
                    + backends[actBk].key + ".json"
                Layout.fillWidth: true
                activeFocusOnTab: true
                Accessible.role: Accessible.EditableText
                Accessible.name: "Export output path"
                Accessible.description:
                    "File path for the exported JSON dump" }
            CAlert { severity: "success"
                text: "Export includes all tenants and entity data ("
                    + backends[actBk].records + " records)." }
        }
    }
    Dialog {
        id: impDlg; visible: showImpDlg; title: "Import Database"
        modal: true; anchors.centerIn: parent; width: 420
        standardButtons: Dialog.Ok | Dialog.Cancel
        onAccepted: showImpDlg = false; onRejected: showImpDlg = false
        ColumnLayout {
            spacing: 12; width: parent.width
            CText { variant: "body1"
                text: "Import a JSON dump into the active backend ("
                    + backends[actBk].name + ")." }
            CTextField { label: "Import file"
                placeholderText: "/path/to/dbal-export.json"
                Layout.fillWidth: true
                activeFocusOnTab: true
                Accessible.role: Accessible.EditableText
                Accessible.name: "Import file path"
                Accessible.description:
                    "Path to the JSON dump file to import" }
            CAlert { severity: "warning"
                text: "Existing records with matching IDs "
                    + "will be overwritten." }
        }
    }
    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 16
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "Database Manager" }
            CStatusBadge { status: "success"
                text: Logic.connectedCount(backends) + " / " + backends.length
                    + " connected" }
            CBadge { text: useLiveData ? "Connected to DBAL" : "Mock Data"
                badgeColor: useLiveData ? Theme.success : Theme.warning }
            Item { Layout.fillWidth: true }
            CButton { text: "Export"
                variant: "ghost"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Export Database"
                Accessible.description:
                    "Export the active database to a JSON file"
                Keys.onReturnPressed: showExpDlg = true
                Keys.onSpacePressed: showExpDlg = true
                onClicked: showExpDlg = true }
            CButton { text: "Import"
                variant: "ghost"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Import Database"
                Accessible.description:
                    "Import a JSON dump into the active backend"
                Keys.onReturnPressed: showImpDlg = true
                Keys.onSpacePressed: showImpDlg = true
                onClicked: showImpDlg = true }
        }
        CDatabaseStatsRow {
            totalRecords: Logic.totalRecords(backends).toLocaleString()
            totalSize: Logic.formatSize(Logic.totalSize(backends))
            activeBackend: backends[actBk].name
                adapterPattern: adPats[root.adPat]
        }
        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
            CBackendListSidebar { backends: root.backends; selectedIndex: selBk
                onBackendSelected: function(i) { selBk = i } }
            ColumnLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
                CBackendDetailPanel {
                    backend: backends[selBk]; isActive: selBk === actBk
                    testingIndex: root.testIdx
                        backendIndex: selBk; testResult: testRes[selBk]
                    onTestConnectionRequested: Logic.testConnectionLive(root,
                        dbal, testTimer, selBk)
                    onSetActiveRequested: actBk = selBk
                }
                CDatabaseEnvConfig {
                    databaseUrl: root.dbUrl; cacheUrl: root.cacheUrl
                    searchUrl: root.searchUrl; selectedPattern: root.adPat
                    onDatabaseUrlEdited: function(v) { root.dbUrl = v }
                    onCacheUrlEdited: function(v) { root.cacheUrl = v }
                    onSearchUrlEdited: function(v) { root.searchUrl = v }
                    onPatternChanged: function(i) { root.adPat = i }
                }
            }
        }
    }
}

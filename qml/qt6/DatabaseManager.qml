import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "../MetaBuilder/DatabaseLogic.js" as Logic

Rectangle {
    id: root
    color: Theme.background

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property int selectedBackendIndex: 2
    property int activeBackendIndex: 2
    property string databaseUrl: "sqlite:///var/lib/dbal/metabuilder.db"
    property string cacheUrl: "redis://localhost:6379/0?ttl=300&pattern=read-through"
    property string searchUrl: "http://localhost:9200?index=dbal_search&refresh=true"
    property int adapterPattern: 0
    property bool showExportDialog: false
    property bool showImportDialog: false
    property var adapterPatterns: []
    property var backends: []
    property var testingIndex: -1
    property var testResults: ({})

    function loadSeedData() {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl("config/database-backends.json"), false); xhr.send()
        if (xhr.status === 200) { var d = JSON.parse(xhr.responseText); backends = d.backends; adapterPatterns = d.adapterPatterns }
    }

    Timer {
        id: testTimer; property int targetIndex: -1; interval: 1500
        onTriggered: {
            var backend = backends[targetIndex]
            var result = (backend.status === "connected") ? "success" : (backend.status === "error" ? "error" : "warning")
            var newResults = Object.assign({}, testResults); newResults[targetIndex] = result; testResults = newResults; testingIndex = -1
        }
    }

    onUseLiveDataChanged: { if (useLiveData) Logic.loadAdapterStatus(root, dbal) }
    Component.onCompleted: { loadSeedData(); Logic.loadAdapterStatus(root, dbal) }

    Dialog {
        id: exportDialog; visible: showExportDialog; title: "Export Database"; modal: true; anchors.centerIn: parent; width: 420
        standardButtons: Dialog.Ok | Dialog.Cancel; onAccepted: showExportDialog = false; onRejected: showExportDialog = false
        ColumnLayout {
            spacing: 12; width: parent.width
            CText { variant: "body1"; text: "Export the active database (" + backends[activeBackendIndex].name + ") to a JSON dump file." }
            CTextField { label: "Output path"; text: "/tmp/dbal-export-" + backends[activeBackendIndex].key + ".json"; Layout.fillWidth: true }
            CAlert { severity: "success"; text: "Export includes all tenants and entity data (" + backends[activeBackendIndex].records + " records)." }
        }
    }

    Dialog {
        id: importDialog; visible: showImportDialog; title: "Import Database"; modal: true; anchors.centerIn: parent; width: 420
        standardButtons: Dialog.Ok | Dialog.Cancel; onAccepted: showImportDialog = false; onRejected: showImportDialog = false
        ColumnLayout {
            spacing: 12; width: parent.width
            CText { variant: "body1"; text: "Import a JSON dump into the active backend (" + backends[activeBackendIndex].name + ")." }
            CTextField { label: "Import file"; placeholderText: "/path/to/dbal-export.json"; Layout.fillWidth: true }
            CAlert { severity: "warning"; text: "Existing records with matching IDs will be overwritten." }
        }
    }

    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 16

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "Database Manager" }
            CStatusBadge { status: "success"; text: Logic.connectedCount(backends) + " / " + backends.length + " connected" }
            CBadge { text: useLiveData ? "Connected to DBAL" : "Mock Data"; badgeColor: useLiveData ? Theme.success : Theme.warning }
            Item { Layout.fillWidth: true }
            CButton { text: "Export"; variant: "ghost"; onClicked: showExportDialog = true }
            CButton { text: "Import"; variant: "ghost"; onClicked: showImportDialog = true }
        }

        CDatabaseStatsRow {
            totalRecords: Logic.totalRecords(backends).toLocaleString()
            totalSize: Logic.formatSize(Logic.totalSize(backends))
            activeBackend: backends[activeBackendIndex].name
            adapterPattern: adapterPatterns[root.adapterPattern]
        }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
            CBackendListSidebar { backends: root.backends; selectedIndex: selectedBackendIndex; onBackendSelected: function(index) { selectedBackendIndex = index } }
            ColumnLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16
                CBackendDetailPanel {
                    backend: backends[selectedBackendIndex]; isActive: selectedBackendIndex === activeBackendIndex
                    testingIndex: root.testingIndex; backendIndex: selectedBackendIndex; testResult: testResults[selectedBackendIndex]
                    onTestConnectionRequested: Logic.testConnectionLive(root, dbal, testTimer, selectedBackendIndex)
                    onSetActiveRequested: activeBackendIndex = selectedBackendIndex
                }
                CCard {
                    Layout.fillWidth: true
                    ColumnLayout {
                        anchors.fill: parent; anchors.margins: 16; spacing: 12
                        CText { variant: "subtitle1"; text: "Environment Configuration" }
                        CTextField { label: "DATABASE_URL"; text: databaseUrl; onTextChanged: databaseUrl = text; placeholderText: "sqlite:///path/to/db or postgres://user:pass@host/db"; Layout.fillWidth: true }
                        CTextField { label: "DBAL_CACHE_URL (Redis)"; text: cacheUrl; onTextChanged: cacheUrl = text; placeholderText: "redis://localhost:6379/0?ttl=300&pattern=read-through"; Layout.fillWidth: true }
                        CTextField { label: "DBAL_SEARCH_URL (Elasticsearch)"; text: searchUrl; onTextChanged: searchUrl = text; placeholderText: "http://localhost:9200?index=dbal_search&refresh=true"; Layout.fillWidth: true }
                        CDivider { Layout.fillWidth: true }
                        CAdapterPatternSelector { selectedPattern: root.adapterPattern; onPatternChanged: function(index) { root.adapterPattern = index } }
                        Item { height: 16 }
                    }
                }
            }
        }
    }
}

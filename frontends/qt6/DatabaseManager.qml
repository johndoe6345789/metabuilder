import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    // ── State ──────────────────────────────────────────────────────────
    property int selectedBackendIndex: 2
    property int activeBackendIndex: 2
    property string databaseUrl: "sqlite:///var/lib/dbal/metabuilder.db"
    property string cacheUrl: "redis://localhost:6379/0?ttl=300&pattern=read-through"
    property string searchUrl: "http://localhost:9200?index=dbal_search&refresh=true"
    property int adapterPattern: 0
    property bool showExportDialog: false
    property bool showImportDialog: false
    property var adapterPatterns: ["read-through", "write-through", "cache-aside", "dual-write"]

    property var backends: [
        { name: "Memory",        key: "memory",        status: "connected",    description: "In-memory store for testing and development",               connectionString: ":memory:",                                        records: 142,   sizeKb: 56,    lastBackup: "N/A (volatile)" },
        { name: "SQLite",        key: "sqlite",        status: "connected",    description: "Embedded database, generic CRUD via Inja SQL templates",    connectionString: "sqlite:///var/lib/dbal/metabuilder.db",           records: 8741,  sizeKb: 3200,  lastBackup: "2026-03-18 02:00" },
        { name: "PostgreSQL",    key: "postgres",      status: "connected",    description: "Direct connection, no ORM. Primary production backend",     connectionString: "postgres://dbal:secret@db:5432/metabuilder",      records: 54320, sizeKb: 98400, lastBackup: "2026-03-18 04:30" },
        { name: "MySQL",         key: "mysql",         status: "disconnected", description: "Direct connection, no ORM",                                 connectionString: "mysql://dbal:secret@mysql:3306/metabuilder",      records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "MariaDB",       key: "mariadb",       status: "disconnected", description: "Reuses MySQL adapter with MariaDB-specific extensions",     connectionString: "mariadb://dbal:secret@mariadb:3306/metabuilder",  records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "CockroachDB",   key: "cockroachdb",   status: "disconnected", description: "Distributed SQL, reuses PostgreSQL adapter",                connectionString: "cockroachdb://root@crdb:26257/metabuilder",       records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "MongoDB",       key: "mongodb",       status: "error",        description: "Document store with JSON to BSON bridging",                 connectionString: "mongodb://mongo:27017/metabuilder",               records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "Redis",         key: "redis",         status: "connected",    description: "Cache layer (L1/L2 with primary DB)",                       connectionString: "redis://localhost:6379/0?ttl=300",                records: 1205,  sizeKb: 820,   lastBackup: "N/A (cache)" },
        { name: "Elasticsearch", key: "elasticsearch", status: "connected",    description: "Full-text search and analytics layer",                      connectionString: "http://localhost:9200?index=dbal_search",         records: 48210, sizeKb: 62100, lastBackup: "2026-03-18 03:15" },
        { name: "Cassandra",     key: "cassandra",     status: "disconnected", description: "Wide-column store for high-throughput writes",               connectionString: "cassandra://cassandra:9042/metabuilder",          records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "SurrealDB",     key: "surrealdb",     status: "disconnected", description: "Multi-model database: documents, graphs, and KV",           connectionString: "ws://surrealdb:8000/rpc",                         records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "Supabase",      key: "supabase",      status: "disconnected", description: "PostgreSQL + REST + Realtime + Row Level Security",         connectionString: "https://project.supabase.co?apikey=...",          records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "Prisma",        key: "prisma",        status: "disconnected", description: "ORM with HTTP bridge for schema-driven access",             connectionString: "prisma://localhost:4466/metabuilder",             records: 0,     sizeKb: 0,     lastBackup: "Never" },
        { name: "Generic",       key: "generic",       status: "disconnected", description: "Custom adapter via DATABASE_URL with driver query params",  connectionString: "generic://localhost:9999/custom?driver=mydriver", records: 0,     sizeKb: 0,     lastBackup: "Never" }
    ]

    // ── Testing state ─────────────────────────────────────────────
    property var testingIndex: -1
    property var testResults: ({})

    Timer {
        id: testTimer
        property int targetIndex: -1
        interval: 1500
        onTriggered: {
            var backend = backends[targetIndex]
            var result = (backend.status === "connected") ? "success" : (backend.status === "error" ? "error" : "warning")
            var newResults = Object.assign({}, testResults); newResults[targetIndex] = result
            testResults = newResults; testingIndex = -1
        }
    }

    function formatSize(kb) { return kb < 1024 ? kb + " KB" : (kb / 1024).toFixed(1) + " MB" }
    function totalRecords() { var s = 0; for (var i = 0; i < backends.length; i++) s += backends[i].records; return s }
    function totalSize() { var s = 0; for (var i = 0; i < backends.length; i++) s += backends[i].sizeKb; return s }
    function connectedCount() { var c = 0; for (var i = 0; i < backends.length; i++) if (backends[i].status === "connected") c++; return c }

    function testConnectionLive(index) {
        testingIndex = index
        if (useLiveData) {
            dbal.execute("core/test-connection", { adapter: backends[index].key }, function(result, error) {
                var newResults = Object.assign({}, testResults)
                newResults[index] = (!error && result && result.success) ? "success" : "error"
                testResults = newResults; testingIndex = -1
            })
        } else { testTimer.targetIndex = index; testTimer.start() }
    }

    function loadAdapterStatus() {
        dbal.execute("core/adapters", {}, function(result, error) {
            if (!error && result && result.adapters && result.adapters.length > 0) {
                var liveBackends = []
                for (var i = 0; i < result.adapters.length; i++) {
                    var a = result.adapters[i]
                    liveBackends.push({ name: a.name || "", key: a.key || "", status: a.status || "disconnected", description: a.description || "",
                                        connectionString: a.connectionString || "", records: a.records || 0, sizeKb: a.sizeKb || 0, lastBackup: a.lastBackup || "Never" })
                }
                backends = liveBackends
                if (selectedBackendIndex >= liveBackends.length) selectedBackendIndex = 0
                if (activeBackendIndex >= liveBackends.length) activeBackendIndex = 0
            }
        })
    }

    onUseLiveDataChanged: { if (useLiveData) loadAdapterStatus() }
    Component.onCompleted: { loadAdapterStatus() }

    // ── Export/Import Dialogs ────────────────────────────────────────
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

    // ── Main Layout ────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 16

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "Database Manager" }
            CStatusBadge { status: "success"; text: connectedCount() + " / " + backends.length + " connected" }
            CBadge { text: useLiveData ? "Connected to DBAL" : "Mock Data"; color: useLiveData ? Theme.success : Theme.warning }
            Item { Layout.fillWidth: true }
            CButton { text: "Export"; variant: "ghost"; onClicked: showExportDialog = true }
            CButton { text: "Import"; variant: "ghost"; onClicked: showImportDialog = true }
        }

        CDatabaseStatsRow {
            totalRecords: root.totalRecords().toLocaleString()
            totalSize: root.formatSize(root.totalSize())
            activeBackend: backends[activeBackendIndex].name
            adapterPattern: adapterPatterns[root.adapterPattern]
        }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

            CBackendListSidebar {
                backends: root.backends
                selectedIndex: selectedBackendIndex
                onBackendSelected: function(index) { selectedBackendIndex = index }
            }

            ColumnLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

                CBackendDetailPanel {
                    backend: backends[selectedBackendIndex]
                    isActive: selectedBackendIndex === activeBackendIndex
                    testingIndex: root.testingIndex
                    backendIndex: selectedBackendIndex
                    testResult: testResults[selectedBackendIndex]
                    onTestConnectionRequested: testConnectionLive(selectedBackendIndex)
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

                        CAdapterPatternSelector {
                            selectedPattern: root.adapterPattern
                            onPatternChanged: function(index) { root.adapterPattern = index }
                        }

                        Item { height: 16 }
                    }
                }
            }
        }
    }
}

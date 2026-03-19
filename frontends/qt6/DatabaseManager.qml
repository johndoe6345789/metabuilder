import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    property bool useLiveData: dbal.connected

    property var mockBackends: JSON.parse(JSON.stringify(backends))

    function loadAdapterStatus() {
        dbal.execute("core/adapters", {}, function(result, error) {
            if (!error && result && result.adapters && result.adapters.length > 0) {
                var liveBackends = []
                for (var i = 0; i < result.adapters.length; i++) {
                    var a = result.adapters[i]
                    liveBackends.push({
                        name: a.name || "",
                        key: a.key || "",
                        status: a.status || "disconnected",
                        description: a.description || "",
                        connectionString: a.connectionString || "",
                        records: a.records || 0,
                        sizeKb: a.sizeKb || 0,
                        lastBackup: a.lastBackup || "Never"
                    })
                }
                backends = liveBackends
                if (selectedBackendIndex >= liveBackends.length)
                    selectedBackendIndex = 0
                if (activeBackendIndex >= liveBackends.length)
                    activeBackendIndex = 0
            }
            // On error or empty result, keep existing mock backends as fallback
        })
    }

    function testConnectionLive(index) {
        var backend = backends[index]
        testingIndex = index
        if (useLiveData) {
            dbal.execute("core/test-connection", { adapter: backend.key }, function(result, error) {
                var newResults = Object.assign({}, testResults)
                if (!error && result && result.success) {
                    newResults[index] = "success"
                } else {
                    newResults[index] = "error"
                }
                testResults = newResults
                testingIndex = -1
            })
        } else {
            // Fall back to mock timer
            testTimer.targetIndex = index
            testTimer.start()
        }
    }

    function checkHealth() {
        if (useLiveData) {
            dbal.ping()
        }
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadAdapterStatus()
    }

    Component.onCompleted: {
        loadAdapterStatus()
    }

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

    // ── Mock testing state ─────────────────────────────────────────────
    property var testingIndex: -1
    property var testResults: ({})

    function testConnection(index) {
        testingIndex = index
        testResults = Object.assign({}, testResults)
        delete testResults[index]
        testTimer.targetIndex = index
        testTimer.start()
    }

    Timer {
        id: testTimer
        property int targetIndex: -1
        interval: 1500
        onTriggered: {
            var backend = backends[targetIndex]
            var result = (backend.status === "connected") ? "success" : (backend.status === "error" ? "error" : "warning")
            var newResults = Object.assign({}, testResults)
            newResults[targetIndex] = result
            testResults = newResults
            testingIndex = -1
        }
    }

    function formatSize(kb) {
        if (kb < 1024) return kb + " KB"
        return (kb / 1024).toFixed(1) + " MB"
    }

    function totalRecords() {
        var sum = 0
        for (var i = 0; i < backends.length; i++) sum += backends[i].records
        return sum
    }

    function totalSize() {
        var sum = 0
        for (var i = 0; i < backends.length; i++) sum += backends[i].sizeKb
        return sum
    }

    function connectedCount() {
        var count = 0
        for (var i = 0; i < backends.length; i++)
            if (backends[i].status === "connected") count++
        return count
    }

    // ── Export Dialog ──────────────────────────────────────────────────
    Dialog {
        id: exportDialog
        visible: showExportDialog
        title: "Export Database"
        modal: true
        anchors.centerIn: parent
        width: 420
        standardButtons: Dialog.Ok | Dialog.Cancel
        onAccepted: showExportDialog = false
        onRejected: showExportDialog = false

        ColumnLayout {
            spacing: 12
            width: parent.width

            CText { variant: "body1"; text: "Export the active database (" + backends[activeBackendIndex].name + ") to a JSON dump file." }
            CTextField { label: "Output path"; text: "/tmp/dbal-export-" + backends[activeBackendIndex].key + ".json"; Layout.fillWidth: true }
            CAlert { severity: "success"; text: "Export includes all tenants and entity data (" + backends[activeBackendIndex].records + " records)." }
        }
    }

    // ── Import Dialog ──────────────────────────────────────────────────
    Dialog {
        id: importDialog
        visible: showImportDialog
        title: "Import Database"
        modal: true
        anchors.centerIn: parent
        width: 420
        standardButtons: Dialog.Ok | Dialog.Cancel
        onAccepted: showImportDialog = false
        onRejected: showImportDialog = false

        ColumnLayout {
            spacing: 12
            width: parent.width

            CText { variant: "body1"; text: "Import a JSON dump into the active backend (" + backends[activeBackendIndex].name + ")." }
            CTextField { label: "Import file"; placeholderText: "/path/to/dbal-export.json"; Layout.fillWidth: true }
            CAlert { severity: "warning"; text: "Existing records with matching IDs will be overwritten." }
        }
    }

    // ── Main Layout ────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // ── Header ────────────────────────────────────────────────────
        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "h3"; text: "Database Manager" }
            CStatusBadge { status: "success"; text: connectedCount() + " / " + backends.length + " connected" }

            CBadge {
                text: useLiveData ? "Connected to DBAL" : "Mock Data"
                color: useLiveData ? Theme.success : Theme.warning
            }

            Item { Layout.fillWidth: true }

            CButton { text: "Export"; variant: "ghost"; onClicked: showExportDialog = true }
            CButton { text: "Import"; variant: "ghost"; onClicked: showImportDialog = true }
        }

        // ── Stats Row ─────────────────────────────────────────────────
        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CCard {
                Layout.fillWidth: true
                implicitHeight: 72

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 4
                    CText { variant: "caption"; text: "Total Records" }
                    CText { variant: "h4"; text: totalRecords().toLocaleString() }
                }
            }

            CCard {
                Layout.fillWidth: true
                implicitHeight: 72

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 4
                    CText { variant: "caption"; text: "Total Size" }
                    CText { variant: "h4"; text: formatSize(totalSize()) }
                }
            }

            CCard {
                Layout.fillWidth: true
                implicitHeight: 72

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 4
                    CText { variant: "caption"; text: "Active Backend" }
                    CText { variant: "h4"; text: backends[activeBackendIndex].name }
                }
            }

            CCard {
                Layout.fillWidth: true
                implicitHeight: 72

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 4
                    CText { variant: "caption"; text: "Adapter Pattern" }
                    CText { variant: "h4"; text: adapterPatterns[adapterPattern] }
                }
            }
        }

        // ── Body: Sidebar + Detail ────────────────────────────────────
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            // ── Backend List (sidebar) ────────────────────────────────
            CCard {
                Layout.preferredWidth: 300
                Layout.fillHeight: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 8

                    CText { variant: "subtitle1"; text: "Backends (14)" }
                    CDivider { Layout.fillWidth: true }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: backends
                        spacing: 4
                        clip: true

                        delegate: CListItem {
                            width: parent ? parent.width : 268
                            title: modelData.name
                            subtitle: modelData.key
                            selected: index === selectedBackendIndex
                            leadingIcon: modelData.status === "connected" ? "check_circle" : (modelData.status === "error" ? "error" : "radio_button_unchecked")

                            onClicked: selectedBackendIndex = index

                            CStatusBadge {
                                anchors.right: parent.right
                                anchors.rightMargin: 12
                                anchors.verticalCenter: parent.verticalCenter
                                status: modelData.status === "connected" ? "success" : (modelData.status === "error" ? "error" : "warning")
                                text: modelData.status
                            }
                        }
                    }
                }
            }

            // ── Detail Panel ──────────────────────────────────────────
            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true

                Flickable {
                    anchors.fill: parent
                    anchors.margins: 16
                    contentHeight: detailColumn.implicitHeight
                    clip: true

                    ColumnLayout {
                        id: detailColumn
                        width: parent.width
                        spacing: 16

                        // ── Backend Header ────────────────────────────
                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CText { variant: "h4"; text: backends[selectedBackendIndex].name }
                            CStatusBadge {
                                status: backends[selectedBackendIndex].status === "connected" ? "success" : (backends[selectedBackendIndex].status === "error" ? "error" : "warning")
                                text: backends[selectedBackendIndex].status
                            }

                            Item { Layout.fillWidth: true }

                            CBadge {
                                text: selectedBackendIndex === activeBackendIndex ? "ACTIVE" : "INACTIVE"
                                accent: selectedBackendIndex === activeBackendIndex
                            }
                        }

                        CText {
                            variant: "body1"
                            text: backends[selectedBackendIndex].description
                            wrapMode: Text.Wrap
                            Layout.fillWidth: true
                        }

                        CDivider { Layout.fillWidth: true }

                        // ── Connection ────────────────────────────────
                        CText { variant: "subtitle1"; text: "Connection" }

                        CTextField {
                            label: "Connection String"
                            text: backends[selectedBackendIndex].connectionString
                            Layout.fillWidth: true
                        }

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            CButton {
                                text: testingIndex === selectedBackendIndex ? "Testing..." : "Test Connection"
                                variant: "primary"
                                enabled: testingIndex === -1
                                onClicked: testConnectionLive(selectedBackendIndex)
                            }

                            CButton {
                                text: selectedBackendIndex === activeBackendIndex ? "Active Backend" : "Set as Active"
                                variant: selectedBackendIndex === activeBackendIndex ? "ghost" : "primary"
                                enabled: selectedBackendIndex !== activeBackendIndex && backends[selectedBackendIndex].status === "connected"
                                onClicked: activeBackendIndex = selectedBackendIndex
                            }

                            Item { Layout.fillWidth: true }

                            Loader {
                                active: testResults[selectedBackendIndex] !== undefined
                                sourceComponent: CStatusBadge {
                                    status: testResults[selectedBackendIndex] === "success" ? "success" : "error"
                                    text: testResults[selectedBackendIndex] === "success" ? "Connection OK" : "Connection Failed"
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // ── Storage Stats ─────────────────────────────
                        CText { variant: "subtitle1"; text: "Storage Statistics" }

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12

                            CPaper {
                                Layout.fillWidth: true
                                implicitHeight: 60

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 10
                                    spacing: 2
                                    CText { variant: "caption"; text: "Records" }
                                    CText { variant: "h4"; text: backends[selectedBackendIndex].records.toLocaleString() }
                                }
                            }

                            CPaper {
                                Layout.fillWidth: true
                                implicitHeight: 60

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 10
                                    spacing: 2
                                    CText { variant: "caption"; text: "Size" }
                                    CText { variant: "h4"; text: formatSize(backends[selectedBackendIndex].sizeKb) }
                                }
                            }

                            CPaper {
                                Layout.fillWidth: true
                                implicitHeight: 60

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 10
                                    spacing: 2
                                    CText { variant: "caption"; text: "Last Backup" }
                                    CText { variant: "body2"; text: backends[selectedBackendIndex].lastBackup }
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // ── Configuration ─────────────────────────────
                        CText { variant: "subtitle1"; text: "Environment Configuration" }

                        CTextField {
                            label: "DATABASE_URL"
                            text: databaseUrl
                            onTextChanged: databaseUrl = text
                            placeholderText: "sqlite:///path/to/db or postgres://user:pass@host/db"
                            Layout.fillWidth: true
                        }

                        CTextField {
                            label: "DBAL_CACHE_URL (Redis)"
                            text: cacheUrl
                            onTextChanged: cacheUrl = text
                            placeholderText: "redis://localhost:6379/0?ttl=300&pattern=read-through"
                            Layout.fillWidth: true
                        }

                        CTextField {
                            label: "DBAL_SEARCH_URL (Elasticsearch)"
                            text: searchUrl
                            onTextChanged: searchUrl = text
                            placeholderText: "http://localhost:9200?index=dbal_search&refresh=true"
                            Layout.fillWidth: true
                        }

                        CDivider { Layout.fillWidth: true }

                        // ── Multi-Adapter Pattern ─────────────────────
                        CText { variant: "subtitle1"; text: "Multi-Adapter Pattern" }
                        CText { variant: "body2"; text: "Select how the primary, cache, and search adapters coordinate data flow." }

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            Repeater {
                                model: adapterPatterns
                                delegate: CButton {
                                    text: modelData
                                    variant: index === adapterPattern ? "primary" : "ghost"
                                    onClicked: adapterPattern = index
                                }
                            }
                        }

                        CPaper {
                            Layout.fillWidth: true
                            implicitHeight: patternDesc.implicitHeight + 24

                            CText {
                                id: patternDesc
                                anchors.fill: parent
                                anchors.margins: 12
                                variant: "body2"
                                wrapMode: Text.Wrap
                                text: {
                                    var descriptions = [
                                        "Read-through: Reads check cache first. On miss, the cache fetches from the primary DB, stores the result, and returns it. Best for read-heavy workloads.",
                                        "Write-through: Every write goes to both cache and primary DB synchronously. Guarantees consistency at the cost of write latency.",
                                        "Cache-aside: Application manages cache explicitly. Reads check cache, fetch from DB on miss and populate cache. Writes go directly to DB and invalidate cache.",
                                        "Dual-write: Writes are sent to two backends simultaneously (e.g., primary DB + search index). Requires conflict resolution strategy."
                                    ]
                                    return descriptions[adapterPattern]
                                }
                            }
                        }

                        // ── Spacer at bottom ──────────────────────────
                        Item { height: 16 }
                    }
                }
            }
        }
    }
}

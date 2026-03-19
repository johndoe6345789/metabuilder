import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: superGodPanel
    color: Theme.background

    // ── DBAL connection ──
    DBALProvider { id: dbal }

    property bool dbalOnline: dbal.connected

    property int currentTab: 0

    // ── JSON config loader ──
    function loadJsonFile(path) {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl(path), false)
        xhr.send()
        if (xhr.status === 200 || xhr.status === 0) {
            return JSON.parse(xhr.responseText)
        }
        console.warn("Failed to load JSON:", path, xhr.status)
        return null
    }

    // ── Mock fallback data (loaded from JSON config) ──
    property var mockTenants: []
    property var mockGodUsers: []
    property var mockDaemons: []
    property var mockSystemMetrics: ({ cpu: 0, memory: 0, disk: 0, network: 0 })

    // ── Live data (falls back to mock) ──
    property var tenants: []
    property bool showCreateTenantDialog: false
    property string newTenantName: ""
    property string newTenantOwner: ""
    property string newTenantHomepage: ""

    // ── God users data ──
    property var godUsers: []

    // ── Power transfer data ──
    property bool showTransferForm: false
    property string transferFrom: ""
    property string transferTo: ""
    property string transferReason: ""
    property string transferExpiry: ""
    property var pendingTransfers: []
    property var transferHistory: []

    // ── System data ──
    property var daemons: []
    property var systemMetrics: ({ cpu: 0, memory: 0, disk: 0, network: 0 })
    property bool showReseedDialog: false
    property bool showClearCacheDialog: false
    property bool showRestartDialog: false
    property string restartTarget: ""

    property var tabModel: [
        { label: "Tenants" },
        { label: "God Users" },
        { label: "Power Transfer" },
        { label: "System" }
    ]

    // ── DBAL data loading ──
    function loadTenants() {
        dbal.list("tenant", { take: 20 }, function(result, error) {
            if (result && result.items) {
                tenants = result.items;
            } else {
                tenants = mockTenants;
            }
        });
    }

    function loadGodUsers() {
        dbal.list("user", { take: 50 }, function(result, error) {
            if (result && result.items) {
                var gods = [];
                for (var i = 0; i < result.items.length; i++) {
                    var u = result.items[i];
                    if (u.role === "god" || u.role === "supergod") {
                        gods.push(u);
                    }
                }
                godUsers = gods.length > 0 ? gods : mockGodUsers;
            } else {
                godUsers = mockGodUsers;
            }
        });
    }

    function loadSystemHealth() {
        dbal.execute("core/status", {}, function(result, error) {
            if (result) {
                if (result.daemons) daemons = result.daemons;
                if (result.metrics) systemMetrics = result.metrics;
            } else {
                daemons = mockDaemons;
                systemMetrics = mockSystemMetrics;
            }
        });
    }

    function executePowerTransfer(tenantId, newOwnerId) {
        dbal.update("tenant", tenantId, { owner: newOwnerId }, function(result, error) {
            if (result) {
                console.log("Power transfer completed for tenant:", tenantId);
                loadTenants();
            } else {
                console.warn("Power transfer failed:", error);
            }
        });
    }

    function approveTransfer(index) {
        var entry = {
            from: pendingTransfers[index].from,
            to: pendingTransfers[index].to,
            reason: pendingTransfers[index].reason,
            date: "2026-03-18 " + Qt.formatTime(new Date(), "hh:mm"),
            status: "approved"
        };
        var hist = transferHistory.slice();
        hist.unshift(entry);
        transferHistory = hist;
        var pend = pendingTransfers.slice();
        pend.splice(index, 1);
        pendingTransfers = pend;
    }

    function denyTransfer(index) {
        var entry = {
            from: pendingTransfers[index].from,
            to: pendingTransfers[index].to,
            reason: pendingTransfers[index].reason,
            date: "2026-03-18 " + Qt.formatTime(new Date(), "hh:mm"),
            status: "denied"
        };
        var hist = transferHistory.slice();
        hist.unshift(entry);
        transferHistory = hist;
        var pend = pendingTransfers.slice();
        pend.splice(index, 1);
        pendingTransfers = pend;
    }

    Component.onCompleted: {
        // Load mock data from JSON config files
        var tenantData = loadJsonFile("config/supergod-tenants.json");
        if (tenantData) { mockTenants = tenantData; tenants = tenantData; }

        var userData = loadJsonFile("config/supergod-god-users.json");
        if (userData) { mockGodUsers = userData; godUsers = userData; }

        var systemData = loadJsonFile("config/supergod-system-metrics.json");
        if (systemData) {
            if (systemData.daemons) { mockDaemons = systemData.daemons; daemons = systemData.daemons; }
            if (systemData.metrics) { mockSystemMetrics = systemData.metrics; systemMetrics = systemData.metrics; }
        }

        var transferData = loadJsonFile("config/supergod-transfers.json");
        if (transferData) {
            if (transferData.pending) pendingTransfers = transferData.pending;
            if (transferData.history) transferHistory = transferData.history;
        }

        // Then try DBAL for live data
        dbal.ping(function(success) {
            if (success) {
                loadTenants();
                loadGodUsers();
                loadSystemHealth();
            }
        });
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        // ── Header ──
        CCard {
            Layout.fillWidth: true

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h2"; text: "Super God Panel" }
                CBadge { text: "Level 5"; badgeColor: Theme.primary }
                CStatusBadge { status: "success"; text: "Platform Control" }

                Item { Layout.fillWidth: true }

                CButton {
                    text: "Level 4"; variant: "ghost"; size: "sm"
                    onClicked: appWindow.currentView = "god"
                }
                CButton {
                    text: "Level 3"; variant: "ghost"; size: "sm"
                    onClicked: appWindow.currentView = "admin"
                }
                CButton {
                    text: "Level 2"; variant: "ghost"; size: "sm"
                    onClicked: appWindow.currentView = "dashboard"
                }
            }

            CDivider { Layout.fillWidth: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                CChip { text: tenants.length + " Tenants"; chipColor: Theme.primary }
                CChip { text: godUsers.length + " God Users"; chipColor: Theme.primary }
                CChip { text: pendingTransfers.length + " Pending Transfers"; chipColor: Theme.warning }
                CChip { text: "14 DB Backends"; chipColor: Theme.info }
                CChip { text: "4 Daemons"; chipColor: Theme.success }
            }
        }

        // ── Tab bar ──
        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            tabs: tabModel
        }

        // ── Tab content ──
        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            // ── 0 - TENANTS ──
            Rectangle {
                color: "transparent"
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12
                            CText { variant: "h3"; text: "Tenant Management" }
                            Item { Layout.fillWidth: true }
                            CButton {
                                text: "Create Tenant"; variant: "primary"; size: "sm"
                                onClicked: showCreateTenantDialog = true
                            }
                        }

                        CText {
                            variant: "body2"
                            text: "Cross-tenant provisioning and configuration. Each tenant operates in full isolation with its own schemas, users, and data."
                            wrapMode: Text.Wrap; Layout.fillWidth: true; color: Theme.textSecondary
                        }

                        CDivider { Layout.fillWidth: true }

                        Repeater {
                            model: tenants
                            delegate: CTenantCard {
                                tenant: modelData
                                onEdit: console.log("Configure tenant:", modelData.name)
                            }
                        }
                    }
                }
            }

            // ── 1 - GOD USERS ──
            Rectangle {
                color: "transparent"
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        CText { variant: "h3"; text: "God Users (Level 4+)" }
                        CText {
                            variant: "body2"
                            text: "All users with god-level (L4) or super-god-level (L5) platform access across all tenants."
                            wrapMode: Text.Wrap; Layout.fillWidth: true; color: Theme.textSecondary
                        }

                        CDivider { Layout.fillWidth: true }

                        Repeater {
                            model: godUsers
                            delegate: CGodUserCard {
                                user: modelData
                                onDemote: console.log("Manage user:", modelData.username)
                            }
                        }
                    }
                }
            }

            // ── 2 - POWER TRANSFER ──
            Rectangle {
                color: "transparent"
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 12
                            CText { variant: "h3"; text: "Power Transfer" }
                            Item { Layout.fillWidth: true }
                            CButton {
                                text: showTransferForm ? "Cancel" : "Initiate Transfer"
                                variant: showTransferForm ? "ghost" : "primary"; size: "sm"
                                onClicked: showTransferForm = !showTransferForm
                            }
                        }

                        CText {
                            variant: "body2"
                            text: "Transfer elevated privileges between god-level users. All transfers require approval and are logged for audit."
                            wrapMode: Text.Wrap; Layout.fillWidth: true; color: Theme.textSecondary
                        }

                        // ── Transfer form ──
                        CCard {
                            Layout.fillWidth: true
                            visible: showTransferForm

                            CText { variant: "h4"; text: "New Transfer Request" }
                            CDivider { Layout.fillWidth: true }

                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 16
                                CTextField {
                                    Layout.fillWidth: true; label: "From User"
                                    placeholderText: "e.g. admin"; text: transferFrom
                                    onTextChanged: transferFrom = text
                                }
                                CTextField {
                                    Layout.fillWidth: true; label: "To User"
                                    placeholderText: "e.g. devops"; text: transferTo
                                    onTextChanged: transferTo = text
                                }
                            }

                            CTextField {
                                Layout.fillWidth: true; label: "Reason"
                                placeholderText: "Describe the reason for this transfer"
                                text: transferReason; onTextChanged: transferReason = text
                            }

                            CTextField {
                                Layout.fillWidth: true; label: "Expiry Date"
                                placeholderText: "YYYY-MM-DD"
                                text: transferExpiry; onTextChanged: transferExpiry = text
                            }

                            FlexRow {
                                Layout.fillWidth: true; spacing: 8
                                Item { Layout.fillWidth: true }
                                CButton {
                                    text: "Submit Transfer"; variant: "primary"; size: "sm"
                                    onClicked: {
                                        if (transferFrom && transferTo && transferReason) {
                                            var updated = pendingTransfers.slice();
                                            updated.push({ from: transferFrom, to: transferTo, reason: transferReason, expiry: transferExpiry || "No expiry", status: "pending" });
                                            pendingTransfers = updated;
                                            transferFrom = ""; transferTo = ""; transferReason = ""; transferExpiry = "";
                                            showTransferForm = false;
                                        }
                                    }
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // ── Pending transfers ──
                        CText { variant: "h4"; text: "Pending Transfers (" + pendingTransfers.length + ")" }

                        Repeater {
                            model: pendingTransfers
                            delegate: CTransferCard {
                                transfer: modelData
                                onApprove: approveTransfer(index)
                                onDeny: denyTransfer(index)
                            }
                        }

                        CAlert { severity: "info"; text: "No pending transfers."; visible: pendingTransfers.length === 0 }

                        CDivider { Layout.fillWidth: true }

                        // ── Transfer history ──
                        CText { variant: "h4"; text: "Transfer History" }

                        Repeater {
                            model: transferHistory
                            delegate: CCard {
                                Layout.fillWidth: true; variant: "outlined"
                                RowLayout {
                                    Layout.fillWidth: true; spacing: 16
                                    ColumnLayout {
                                        spacing: 4; Layout.fillWidth: true
                                        FlexRow {
                                            spacing: 8
                                            CText { variant: "subtitle1"; text: modelData.from + " -> " + modelData.to }
                                            CStatusBadge { status: modelData.status === "approved" ? "success" : "error"; text: modelData.status }
                                        }
                                        CText { variant: "body2"; text: modelData.reason; wrapMode: Text.Wrap; Layout.fillWidth: true }
                                    }
                                    CText { variant: "caption"; text: modelData.date; color: Theme.textSecondary }
                                }
                            }
                        }
                    }
                }
            }

            // ── 3 - SYSTEM ──
            Rectangle {
                color: "transparent"
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    ColumnLayout {
                        width: parent.width
                        spacing: 16

                        CText { variant: "h3"; text: "System Overview" }
                        CText { variant: "h4"; text: "Daemon Status" }

                        GridLayout {
                            Layout.fillWidth: true; columns: 2; columnSpacing: 16; rowSpacing: 16
                            Repeater {
                                model: daemons
                                delegate: CCard {
                                    Layout.fillWidth: true
                                    FlexRow {
                                        Layout.fillWidth: true; spacing: 10
                                        CText { variant: "subtitle1"; text: modelData.name }
                                        CStatusBadge { status: modelData.status === "healthy" ? "success" : "warning"; text: modelData.status }
                                        Item { Layout.fillWidth: true }
                                        CBadge { text: ":" + modelData.port; badgeColor: Theme.info }
                                    }
                                    CText { variant: "caption"; text: "Uptime: " + modelData.uptime; color: Theme.textSecondary }
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }
                        CText { variant: "h4"; text: "System Metrics" }

                        GridLayout {
                            Layout.fillWidth: true; columns: 4; columnSpacing: 16; rowSpacing: 16
                            Repeater {
                                model: [
                                    { label: "CPU", value: systemMetrics.cpu },
                                    { label: "Memory", value: systemMetrics.memory },
                                    { label: "Disk", value: systemMetrics.disk },
                                    { label: "Network", value: systemMetrics.network }
                                ]
                                delegate: CSystemMetricCard { label: modelData.label; value: modelData.value }
                            }
                        }

                        CDivider { Layout.fillWidth: true }
                        CText { variant: "h4"; text: "System Actions" }

                        FlexRow {
                            Layout.fillWidth: true; spacing: 12
                            CButton { text: "Force Re-seed"; variant: "primary"; size: "sm"; onClicked: showReseedDialog = true }
                            CButton { text: "Clear Cache"; variant: "ghost"; size: "sm"; onClicked: showClearCacheDialog = true }
                            CButton { text: "Restart DBAL"; variant: "danger"; size: "sm"; onClicked: { restartTarget = "DBAL"; showRestartDialog = true } }
                            CButton { text: "Restart Redis"; variant: "danger"; size: "sm"; onClicked: { restartTarget = "Redis"; showRestartDialog = true } }
                        }

                        CDivider { Layout.fillWidth: true }
                        CText { variant: "h4"; text: "Environment" }

                        CCard {
                            Layout.fillWidth: true
                            RowLayout {
                                Layout.fillWidth: true; spacing: 24
                                ColumnLayout {
                                    spacing: 4
                                    CText { variant: "caption"; text: "Version"; color: Theme.textSecondary }
                                    CText { variant: "body1"; text: "2.5.0-rc1" }
                                }
                                ColumnLayout {
                                    spacing: 4
                                    CText { variant: "caption"; text: "Build Date"; color: Theme.textSecondary }
                                    CText { variant: "body1"; text: "2026-03-15" }
                                }
                                ColumnLayout {
                                    spacing: 4
                                    CText { variant: "caption"; text: "Node Count"; color: Theme.textSecondary }
                                    CText { variant: "body1"; text: "4 nodes" }
                                }
                                ColumnLayout {
                                    spacing: 4
                                    CText { variant: "caption"; text: "Platform"; color: Theme.textSecondary }
                                    CText { variant: "body1"; text: "MetaBuilder Universal" }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ── DIALOGS ──

    CDialog {
        id: createTenantDialog; visible: showCreateTenantDialog; title: "Create Tenant"
        ColumnLayout {
            spacing: 12; width: 400
            CText { variant: "body2"; text: "Provision a new isolated tenant with its own schemas, users, and data store."; wrapMode: Text.Wrap; Layout.fillWidth: true }
            CTextField { Layout.fillWidth: true; label: "Tenant Name"; placeholderText: "e.g. acme-corp"; text: newTenantName; onTextChanged: newTenantName = text }
            CTextField { Layout.fillWidth: true; label: "Owner"; placeholderText: "e.g. admin@acme.com"; text: newTenantOwner; onTextChanged: newTenantOwner = text }
            CTextField { Layout.fillWidth: true; label: "Homepage"; placeholderText: "e.g. /acme"; text: newTenantHomepage; onTextChanged: newTenantHomepage = text }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; size: "sm"; onClicked: showCreateTenantDialog = false }
                CButton {
                    text: "Create"; variant: "primary"; size: "sm"
                    onClicked: {
                        if (newTenantName && newTenantOwner) {
                            var updated = tenants.slice();
                            updated.push({ name: newTenantName, owner: newTenantOwner, status: "active", homepage: newTenantHomepage || "/", created: "2026-03-18" });
                            tenants = updated;
                            newTenantName = ""; newTenantOwner = ""; newTenantHomepage = "";
                            showCreateTenantDialog = false;
                        }
                    }
                }
            }
        }
    }

    CDialog {
        id: reseedDialog; visible: showReseedDialog; title: "Force Re-seed"
        ColumnLayout {
            spacing: 12; width: 400
            CAlert { severity: "warning"; text: "This will re-run all seed data scripts. Existing seed records will be skipped (idempotent), but this may take several minutes." }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; size: "sm"; onClicked: showReseedDialog = false }
                CButton { text: "Re-seed"; variant: "primary"; size: "sm"; onClicked: showReseedDialog = false }
            }
        }
    }

    CDialog {
        id: clearCacheDialog; visible: showClearCacheDialog; title: "Clear Cache"
        ColumnLayout {
            spacing: 12; width: 400
            CAlert { severity: "warning"; text: "This will flush all Redis caches across all tenants. Subsequent requests will experience cache misses until the cache is repopulated." }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; size: "sm"; onClicked: showClearCacheDialog = false }
                CButton { text: "Clear Cache"; variant: "danger"; size: "sm"; onClicked: showClearCacheDialog = false }
            }
        }
    }

    CDialog {
        id: restartDaemonDialog; visible: showRestartDialog; title: "Restart " + restartTarget
        ColumnLayout {
            spacing: 12; width: 400
            CAlert { severity: "error"; text: "Restarting " + restartTarget + " will cause a brief service interruption. All active connections will be dropped. Are you sure?" }
            FlexRow {
                Layout.fillWidth: true; spacing: 8
                Item { Layout.fillWidth: true }
                CButton { text: "Cancel"; variant: "ghost"; size: "sm"; onClicked: showRestartDialog = false }
                CButton { text: "Restart"; variant: "danger"; size: "sm"; onClicked: showRestartDialog = false }
            }
        }
    }
}

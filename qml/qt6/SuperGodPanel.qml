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

    // ── Live data ──
    property var tenants: []
    property var godUsers: []
    property var daemons: []
    property var systemMetrics: ({ cpu: 0, memory: 0, disk: 0, network: 0 })
    property var pendingTransfers: []
    property var transferHistory: []

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

        CSuperGodHeader {
            Layout.fillWidth: true
            tenantCount: tenants.length
            godUserCount: godUsers.length
            pendingTransferCount: pendingTransfers.length
            onNavigateToLevel: function(level) {
                if (level === 4) appWindow.currentView = "god";
                else if (level === 3) appWindow.currentView = "admin";
                else if (level === 2) appWindow.currentView = "dashboard";
            }
        }

        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged: currentTab = currentIndex
            tabs: tabModel
        }

        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            CTenantTab {
                tenants: superGodPanel.tenants
                onCreateTenantRequested: dialogs.showCreateTenant = true
                onEditTenant: function(tenant) { console.log("Configure tenant:", tenant.name) }
            }

            CGodUsersTab {
                godUsers: superGodPanel.godUsers
                onManageUser: function(user) { console.log("Manage user:", user.username) }
            }

            CTransferTab {
                pendingTransfers: superGodPanel.pendingTransfers
                transferHistory: superGodPanel.transferHistory
                onTransferSubmitted: function(from, to, reason, expiry) {
                    var updated = pendingTransfers.slice();
                    updated.push({ from: from, to: to, reason: reason, expiry: expiry, status: "pending" });
                    pendingTransfers = updated;
                }
                onTransferApproved: function(index) { approveTransfer(index) }
                onTransferDenied: function(index) { denyTransfer(index) }
            }

            CSystemTab {
                daemons: superGodPanel.daemons
                systemMetrics: superGodPanel.systemMetrics
                onReseedRequested: dialogs.showReseed = true
                onClearCacheRequested: dialogs.showClearCache = true
                onRestartRequested: function(target) { dialogs.restartTarget = target; dialogs.showRestart = true }
            }
        }
    }

    CSuperGodDialogs {
        id: dialogs
        onTenantCreated: function(name, owner, homepage) {
            var updated = tenants.slice();
            updated.push({ name: name, owner: owner, status: "active", homepage: homepage, created: "2026-03-18" });
            tenants = updated;
        }
    }
}

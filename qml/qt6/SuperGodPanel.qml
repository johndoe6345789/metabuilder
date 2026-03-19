import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "SuperGodCrud.js" as Crud

Rectangle {
    id: root
    color: Theme.background
    objectName: "view_supergod_panel"
    Accessible.role: Accessible.Pane
    Accessible.name: "Super God Panel"

    DBALProvider { id: dbal }
    property bool dbalOnline: dbal.connected
    property int currentTab: 0

    property var mockTenants: []
    property var mockGodUsers: []
    property var mockDaemons: []
    property var mockSystemMetrics: (
        { cpu: 0, memory: 0, disk: 0, network: 0 }
    )

    property var tenants: []
    property var godUsers: []
    property var daemons: []
    property var systemMetrics: (
        { cpu: 0, memory: 0, disk: 0, network: 0 }
    )
    property var pendingTransfers: []
    property var transferHistory: []

    property var tabModel: [
        { label: "Tenants" },
        { label: "God Users" },
        { label: "Power Transfer" },
        { label: "System" }
    ]

    function loadTenants() {
        dbal.list("tenant", { take: 20 },
            function(result, error) {
                tenants = (result && result.items)
                    ? result.items : mockTenants
            }
        )
    }
    function loadGodUsers() {
        dbal.list("user", { take: 50 },
            function(result, error) {
                if (result && result.items) {
                    var g = Crud.filterGodUsers(
                        result.items
                    )
                    godUsers = g.length > 0
                        ? g : mockGodUsers
                } else {
                    godUsers = mockGodUsers
                }
            }
        )
    }
    function loadSystemHealth() {
        dbal.execute("core/status", {},
            function(result, error) {
                if (result) {
                    if (result.daemons)
                        daemons = result.daemons
                    if (result.metrics)
                        systemMetrics = result.metrics
                } else {
                    daemons = mockDaemons
                    systemMetrics = mockSystemMetrics
                }
            }
        )
    }

    function handleTransfer(index, status) {
        var r = Crud.processTransferAction(
            pendingTransfers, transferHistory,
            index, status
        )
        pendingTransfers = r.pending
        transferHistory = r.history
    }

    Component.onCompleted: {
        var td = Crud.loadJsonSync(
            "config/supergod-tenants.json"
        )
        if (td) { mockTenants = td; tenants = td }
        var ud = Crud.loadJsonSync(
            "config/supergod-god-users.json"
        )
        if (ud) { mockGodUsers = ud; godUsers = ud }
        var sd = Crud.loadJsonSync(
            "config/supergod-system-metrics.json"
        )
        if (sd) {
            if (sd.daemons) {
                mockDaemons = sd.daemons
                daemons = sd.daemons
            }
            if (sd.metrics) {
                mockSystemMetrics = sd.metrics
                systemMetrics = sd.metrics
            }
        }
        var xd = Crud.loadJsonSync(
            "config/supergod-transfers.json"
        )
        if (xd) {
            if (xd.pending)
                pendingTransfers = xd.pending
            if (xd.history)
                transferHistory = xd.history
        }
        dbal.ping(function(ok) {
            if (ok) {
                loadTenants()
                loadGodUsers()
                loadSystemHealth()
            }
        })
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20; spacing: 16

        CSuperGodHeader {
            Layout.fillWidth: true
            tenantCount: tenants.length
            godUserCount: godUsers.length
            pendingTransferCount:
                pendingTransfers.length
            onNavigateToLevel: function(level) {
                if (level === 4)
                    appWindow.currentView = "god"
                else if (level === 3)
                    appWindow.currentView = "admin"
                else if (level === 2)
                    appWindow.currentView = "dashboard"
            }
        }

        CTabBar {
            id: tabBar
            Layout.fillWidth: true
            currentIndex: currentTab
            onCurrentIndexChanged:
                currentTab = currentIndex
            tabs: tabModel
            Accessible.role: Accessible.PageTabList
            Accessible.name: "Super God Panel tabs"
        }

        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: currentTab

            CTenantTab {
                tenants: root.tenants
                onCreateTenantRequested:
                    dialogs.showCreateTenant = true
                onEditTenant: function(t) {
                    console.log(
                        "Configure tenant:", t.name
                    )
                }
            }
            CGodUsersTab {
                godUsers: root.godUsers
                onManageUser: function(u) {
                    console.log(
                        "Manage user:", u.username
                    )
                }
            }
            CTransferTab {
                pendingTransfers:
                    root.pendingTransfers
                transferHistory:
                    root.transferHistory
                onTransferSubmitted:
                    function(from, to, reason, expiry) {
                        var u = pendingTransfers.slice()
                        u.push({
                            from: from, to: to,
                            reason: reason,
                            expiry: expiry,
                            status: "pending"
                        })
                        pendingTransfers = u
                    }
                onTransferApproved: function(i) {
                    handleTransfer(i, "approved")
                }
                onTransferDenied: function(i) {
                    handleTransfer(i, "denied")
                }
            }
            CSystemTab {
                daemons: root.daemons
                systemMetrics: root.systemMetrics
                onReseedRequested:
                    dialogs.showReseed = true
                onClearCacheRequested:
                    dialogs.showClearCache = true
                onRestartRequested: function(t) {
                    dialogs.restartTarget = t
                    dialogs.showRestart = true
                }
            }
        }
    }

    CSuperGodDialogs {
        id: dialogs
        onTenantCreated:
            function(name, owner, homepage) {
                var u = tenants.slice()
                u.push({
                    name: name, owner: owner,
                    status: "active",
                    homepage: homepage,
                    created: "2026-03-18"
                })
                tenants = u
            }
    }
}

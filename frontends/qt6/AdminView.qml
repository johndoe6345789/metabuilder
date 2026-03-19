import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"

Rectangle {
    id: root
    color: "transparent"

    // ── DBAL connection ──────────────────────────────────────────
    DBALProvider { id: dbal }

    property bool useLiveData: dbal.connected

    function loadEntityData() {
        if (!useLiveData) return;
        dbal.list(selectedEntity, { take: pageSize, skip: currentPage * pageSize }, function(result, error) {
            if (error || !result) return;
            var items = result.items || [];
            var fields = entityFields[selectedEntity] || [];
            var liveRecords = [];
            for (var i = 0; i < items.length; i++) {
                var rec = {};
                for (var f = 0; f < fields.length; f++) {
                    rec[fields[f]] = items[i][fields[f]] || "";
                }
                liveRecords.push(rec);
            }
            var updated = Object.assign({}, records);
            updated[selectedEntity] = liveRecords;
            records = updated;
        });
    }

    Component.onCompleted: {
        if (useLiveData) loadEntityData();
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadEntityData();
    }

    // ── State ──────────────────────────────────────────────────────
    property string selectedEntity: "User"
    property string searchText: ""
    property string activeFilter: "All"
    property int currentPage: 0
    property int pageSize: 5
    property int selectedRow: -1
    property var selectedRows: ({})
    property bool selectAll: false

    property bool createDialogOpen: false
    property bool editDialogOpen: false
    property bool deleteDialogOpen: false
    property int editingIndex: -1
    property var editingRecord: ({})

    // ── Entity definitions ─────────────────────────────────────────
    property var entities: [
        "User", "Session", "Workflow", "Package", "UiPage",
        "Credential", "Forum", "Notification", "AuditLog", "Media"
    ]

    property var entityIcons: ({
        "User": "\u{1F464}", "Session": "\u{1F513}", "Workflow": "\u{2699}",
        "Package": "\u{1F4E6}", "UiPage": "\u{1F4C4}", "Credential": "\u{1F511}",
        "Forum": "\u{1F4AC}", "Notification": "\u{1F514}", "AuditLog": "\u{1F4CB}",
        "Media": "\u{1F3AC}"
    })

    // Column schemas per entity
    property var entityColumns: ({
        "User":         ["ID", "Username", "Email", "Role", "Status", "Created"],
        "Session":      ["ID", "User", "IP Address", "Status", "Started", "Expires"],
        "Workflow":     ["ID", "Name", "Trigger", "Nodes", "Status", "Last Run"],
        "Package":      ["ID", "Name", "Version", "Author", "Status", "Installed"],
        "UiPage":       ["ID", "Title", "Route", "Layout", "Status", "Modified"],
        "Credential":   ["ID", "Label", "Type", "Scope", "Status", "Created"],
        "Forum":        ["ID", "Title", "Author", "Replies", "Status", "Created"],
        "Notification": ["ID", "Type", "Recipient", "Message", "Status", "Sent"],
        "AuditLog":     ["ID", "Action", "User", "Resource", "Status", "Timestamp"],
        "Media":        ["ID", "Filename", "Type", "Size", "Status", "Uploaded"]
    })

    // Field keys matching columns (for record objects)
    property var entityFields: ({
        "User":         ["id", "username", "email", "role", "status", "created"],
        "Session":      ["id", "user", "ip", "status", "started", "expires"],
        "Workflow":     ["id", "name", "trigger", "nodes", "status", "lastRun"],
        "Package":      ["id", "name", "version", "author", "status", "installed"],
        "UiPage":       ["id", "title", "route", "layout", "status", "modified"],
        "Credential":   ["id", "label", "type", "scope", "status", "created"],
        "Forum":        ["id", "title", "author", "replies", "status", "created"],
        "Notification": ["id", "type", "recipient", "message", "status", "sent"],
        "AuditLog":     ["id", "action", "user", "resource", "status", "timestamp"],
        "Media":        ["id", "filename", "type", "size", "status", "uploaded"]
    })

    // ── Mock data store ────────────────────────────────────────────
    property var records: ({
        "User": [
            { id: "USR-001", username: "admin",      email: "admin@metabuilder.io",    role: "god",       status: "Active",   created: "2025-11-02" },
            { id: "USR-002", username: "jdoe",       email: "jdoe@example.com",        role: "admin",     status: "Active",   created: "2025-12-10" },
            { id: "USR-003", username: "alice",      email: "alice@devteam.org",        role: "editor",    status: "Active",   created: "2026-01-05" },
            { id: "USR-004", username: "bob_dev",    email: "bob@contractor.io",        role: "user",      status: "Inactive", created: "2026-01-18" },
            { id: "USR-005", username: "carol",      email: "carol@metabuilder.io",     role: "admin",     status: "Active",   created: "2026-02-01" },
            { id: "USR-006", username: "dave",       email: "dave@external.com",        role: "user",      status: "Active",   created: "2026-02-14" },
            { id: "USR-007", username: "eve_sec",    email: "eve@security.io",          role: "auditor",   status: "Active",   created: "2026-03-01" },
            { id: "USR-008", username: "frank",      email: "frank@legacy.net",         role: "user",      status: "Inactive", created: "2025-09-20" }
        ],
        "Session": [
            { id: "SES-001", user: "admin",    ip: "192.168.1.10",  status: "Active",  started: "2026-03-18 08:00", expires: "2026-03-18 20:00" },
            { id: "SES-002", user: "jdoe",     ip: "10.0.0.42",     status: "Active",  started: "2026-03-18 09:15", expires: "2026-03-18 21:15" },
            { id: "SES-003", user: "alice",    ip: "172.16.0.5",    status: "Active",  started: "2026-03-18 10:30", expires: "2026-03-18 22:30" },
            { id: "SES-004", user: "bob_dev",  ip: "192.168.1.88",  status: "Inactive", started: "2026-03-17 14:00", expires: "2026-03-17 23:59" },
            { id: "SES-005", user: "carol",    ip: "10.0.0.101",    status: "Active",  started: "2026-03-18 07:45", expires: "2026-03-18 19:45" },
            { id: "SES-006", user: "dave",     ip: "192.168.2.33",  status: "Inactive", started: "2026-03-16 11:00", expires: "2026-03-16 23:00" }
        ],
        "Workflow": [
            { id: "WF-001", name: "on_user_created",     trigger: "User.created",     nodes: "15", status: "Active",   lastRun: "2026-03-18 09:01" },
            { id: "WF-002", name: "on_snippet_saved",    trigger: "Snippet.created",  nodes: "8",  status: "Active",   lastRun: "2026-03-18 08:45" },
            { id: "WF-003", name: "nightly_cleanup",     trigger: "cron:0 2 * * *",   nodes: "12", status: "Active",   lastRun: "2026-03-18 02:00" },
            { id: "WF-004", name: "on_login_failed",     trigger: "Auth.failed",      nodes: "6",  status: "Active",   lastRun: "2026-03-17 23:12" },
            { id: "WF-005", name: "weekly_report",       trigger: "cron:0 9 * * MON", nodes: "20", status: "Inactive", lastRun: "2026-03-11 09:00" },
            { id: "WF-006", name: "media_transcode",     trigger: "Media.uploaded",   nodes: "10", status: "Active",   lastRun: "2026-03-18 07:30" }
        ],
        "Package": [
            { id: "PKG-001", name: "forum",        version: "2.1.0", author: "core-team",  status: "Active",   installed: "2025-12-01" },
            { id: "PKG-002", name: "guestbook",    version: "1.3.2", author: "core-team",  status: "Active",   installed: "2025-12-01" },
            { id: "PKG-003", name: "notifications", version: "1.8.0", author: "core-team", status: "Active",   installed: "2026-01-10" },
            { id: "PKG-004", name: "media-gallery", version: "3.0.1", author: "plugins",   status: "Active",   installed: "2026-01-15" },
            { id: "PKG-005", name: "irc-bridge",   version: "0.9.0", author: "community",  status: "Inactive", installed: "2026-02-05" },
            { id: "PKG-006", name: "analytics",    version: "1.2.0", author: "core-team",  status: "Active",   installed: "2026-02-20" },
            { id: "PKG-007", name: "streaming",    version: "1.0.0", author: "plugins",    status: "Active",   installed: "2026-03-01" }
        ],
        "UiPage": [
            { id: "PG-001", title: "Dashboard",      route: "/",            layout: "full",    status: "Active",   modified: "2026-03-15" },
            { id: "PG-002", title: "User Profile",    route: "/profile",     layout: "sidebar", status: "Active",   modified: "2026-03-10" },
            { id: "PG-003", title: "Settings",        route: "/settings",    layout: "full",    status: "Active",   modified: "2026-03-12" },
            { id: "PG-004", title: "Admin Panel",     route: "/admin",       layout: "sidebar", status: "Active",   modified: "2026-03-18" },
            { id: "PG-005", title: "Workflow Editor", route: "/workflows",   layout: "canvas",  status: "Active",   modified: "2026-03-14" },
            { id: "PG-006", title: "Legacy Import",   route: "/import",      layout: "full",    status: "Inactive", modified: "2026-01-20" }
        ],
        "Credential": [
            { id: "CRD-001", label: "SMTP Production",   type: "smtp",      scope: "global",    status: "Active",   created: "2025-12-01" },
            { id: "CRD-002", label: "AWS S3 Bucket",     type: "aws-s3",    scope: "media",     status: "Active",   created: "2026-01-10" },
            { id: "CRD-003", label: "GitHub Deploy Key",  type: "ssh-key",   scope: "ci-cd",     status: "Active",   created: "2026-01-20" },
            { id: "CRD-004", label: "Slack Webhook",      type: "webhook",   scope: "notifications", status: "Active", created: "2026-02-05" },
            { id: "CRD-005", label: "DB Staging",         type: "database",  scope: "staging",   status: "Inactive", created: "2025-11-15" }
        ],
        "Forum": [
            { id: "FRM-001", title: "Welcome to MetaBuilder",     author: "admin",  replies: "24", status: "Active",   created: "2025-12-05" },
            { id: "FRM-002", title: "Bug: Workflow not firing",    author: "jdoe",   replies: "8",  status: "Active",   created: "2026-02-10" },
            { id: "FRM-003", title: "Feature: Dark mode toggle",   author: "alice",  replies: "15", status: "Active",   created: "2026-02-18" },
            { id: "FRM-004", title: "How to create custom nodes?", author: "dave",   replies: "6",  status: "Active",   created: "2026-03-02" },
            { id: "FRM-005", title: "Migration guide v1 to v2",   author: "carol",  replies: "31", status: "Active",   created: "2026-01-25" },
            { id: "FRM-006", title: "Deprecated: Old API docs",   author: "admin",  replies: "2",  status: "Inactive", created: "2025-10-10" }
        ],
        "Notification": [
            { id: "NTF-001", type: "system",  recipient: "all",     message: "Maintenance window 03/20",  status: "Active",   sent: "2026-03-18 06:00" },
            { id: "NTF-002", type: "alert",   recipient: "admin",   message: "High CPU on dbal-prod",     status: "Active",   sent: "2026-03-18 07:30" },
            { id: "NTF-003", type: "info",    recipient: "jdoe",    message: "Your export is ready",      status: "Active",   sent: "2026-03-18 09:00" },
            { id: "NTF-004", type: "warning", recipient: "eve_sec", message: "3 failed login attempts",   status: "Active",   sent: "2026-03-18 08:15" },
            { id: "NTF-005", type: "system",  recipient: "all",     message: "v2.1.0 deployed",           status: "Inactive", sent: "2026-03-15 12:00" }
        ],
        "AuditLog": [
            { id: "AUD-001", action: "user.login",       user: "admin",    resource: "auth/session",     status: "Active", timestamp: "2026-03-18 08:00" },
            { id: "AUD-002", action: "record.create",    user: "jdoe",     resource: "forum/post",       status: "Active", timestamp: "2026-03-18 08:30" },
            { id: "AUD-003", action: "record.update",    user: "alice",    resource: "workflow/WF-001",  status: "Active", timestamp: "2026-03-18 09:01" },
            { id: "AUD-004", action: "user.logout",      user: "bob_dev", resource: "auth/session",      status: "Active", timestamp: "2026-03-17 18:00" },
            { id: "AUD-005", action: "record.delete",    user: "admin",    resource: "media/MED-003",    status: "Active", timestamp: "2026-03-18 07:45" },
            { id: "AUD-006", action: "config.change",    user: "carol",    resource: "settings/smtp",    status: "Active", timestamp: "2026-03-17 16:30" },
            { id: "AUD-007", action: "auth.failed",      user: "unknown",  resource: "auth/login",       status: "Active", timestamp: "2026-03-18 08:12" }
        ],
        "Media": [
            { id: "MED-001", filename: "logo-dark.svg",     type: "image/svg", size: "12 KB",  status: "Active",   uploaded: "2026-01-05" },
            { id: "MED-002", filename: "hero-banner.png",   type: "image/png", size: "2.4 MB", status: "Active",   uploaded: "2026-02-10" },
            { id: "MED-003", filename: "intro-video.mp4",   type: "video/mp4", size: "48 MB",  status: "Active",   uploaded: "2026-02-20" },
            { id: "MED-004", filename: "user-guide.pdf",    type: "application/pdf", size: "1.1 MB", status: "Active", uploaded: "2026-03-01" },
            { id: "MED-005", filename: "old-theme.css",     type: "text/css",  size: "85 KB",  status: "Inactive", uploaded: "2025-09-15" },
            { id: "MED-006", filename: "avatar-defaults.zip", type: "application/zip", size: "5.6 MB", status: "Active", uploaded: "2026-03-10" }
        ]
    })

    // ── Computed helpers ────────────────────────────────────────────
    function getFilteredRecords() {
        var data = records[selectedEntity] || [];
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var rec = data[i];
            // Filter by status
            if (activeFilter === "Active" && rec.status !== "Active") continue;
            if (activeFilter === "Inactive" && rec.status !== "Inactive") continue;
            // Filter by search text
            if (searchText.length > 0) {
                var fields = entityFields[selectedEntity];
                var match = false;
                for (var f = 0; f < fields.length; f++) {
                    if (String(rec[fields[f]]).toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                        match = true;
                        break;
                    }
                }
                if (!match) continue;
            }
            result.push(rec);
        }
        return result;
    }

    function getPagedRecords() {
        var filtered = getFilteredRecords();
        var start = currentPage * pageSize;
        return filtered.slice(start, start + pageSize);
    }

    function totalFiltered() {
        return getFilteredRecords().length;
    }

    function totalPages() {
        return Math.max(1, Math.ceil(totalFiltered() / pageSize));
    }

    function statCount(entity) {
        return (records[entity] || []).length;
    }

    function generateId() {
        var prefixes = { "User": "USR", "Session": "SES", "Workflow": "WF", "Package": "PKG",
            "UiPage": "PG", "Credential": "CRD", "Forum": "FRM", "Notification": "NTF",
            "AuditLog": "AUD", "Media": "MED" };
        var prefix = prefixes[selectedEntity] || "REC";
        var num = (records[selectedEntity] || []).length + 1;
        return prefix + "-" + String(num).padStart(3, '0');
    }

    function deleteRecord(idx) {
        var data = records[selectedEntity].slice();
        var filtered = getFilteredRecords();
        var actualRec = getPagedRecords()[idx];
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === actualRec.id) {
                data.splice(i, 1);
                break;
            }
        }
        var updated = Object.assign({}, records);
        updated[selectedEntity] = data;
        records = updated;
        selectedRow = -1;
        if (currentPage >= totalPages()) currentPage = Math.max(0, totalPages() - 1);
    }

    function deleteSelectedRows() {
        var data = records[selectedEntity].slice();
        var pagedRecs = getPagedRecords();
        var idsToDelete = {};
        for (var key in selectedRows) {
            if (selectedRows[key]) {
                var rec = pagedRecs[parseInt(key)];
                if (rec) idsToDelete[rec.id] = true;
            }
        }
        var newData = [];
        for (var i = 0; i < data.length; i++) {
            if (!idsToDelete[data[i].id]) newData.push(data[i]);
        }
        var updated = Object.assign({}, records);
        updated[selectedEntity] = newData;
        records = updated;
        selectedRows = {};
        selectAll = false;
        selectedRow = -1;
        if (currentPage >= totalPages()) currentPage = Math.max(0, totalPages() - 1);
    }

    function addRecord(rec) {
        var data = records[selectedEntity].slice();
        data.push(rec);
        var updated = Object.assign({}, records);
        updated[selectedEntity] = data;
        records = updated;
    }

    function updateRecord(rec) {
        var data = records[selectedEntity].slice();
        var pagedRecs = getPagedRecords();
        var targetId = pagedRecs[editingIndex] ? pagedRecs[editingIndex].id : "";
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === targetId) {
                data[i] = rec;
                break;
            }
        }
        var updated = Object.assign({}, records);
        updated[selectedEntity] = data;
        records = updated;
    }

    function hasSelectedRows() {
        for (var key in selectedRows) {
            if (selectedRows[key]) return true;
        }
        return false;
    }

    // Reset pagination/selection on entity change
    onSelectedEntityChanged: {
        currentPage = 0;
        selectedRow = -1;
        selectedRows = {};
        selectAll = false;
        searchText = "";
        activeFilter = "All";
        if (useLiveData) loadEntityData();
    }

    // ── Layout ─────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // ── Stats bar ──────────────────────────────────────────────
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 80
            color: Theme.paper
            border.color: Theme.border
            border.width: 1

            RowLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 12

                Repeater {
                    model: [
                        { label: "Total Users",     key: "User",     accent: "#4CAF50" },
                        { label: "Active Sessions", key: "Session",  accent: "#2196F3" },
                        { label: "Workflows",       key: "Workflow", accent: "#FF9800" },
                        { label: "Audit Events",    key: "AuditLog", accent: "#9C27B0" }
                    ]

                    delegate: CCard {
                        Layout.fillWidth: true
                        Layout.fillHeight: true

                        RowLayout {
                            anchors.fill: parent
                            anchors.margins: 12
                            spacing: 8

                            Rectangle {
                                width: 4
                                Layout.fillHeight: true
                                color: modelData.accent
                                radius: 2
                            }

                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 2
                                CText { variant: "caption"; text: modelData.label; color: Theme.textSecondary }
                                CText { variant: "h3"; text: String(statCount(modelData.key)) }
                            }
                        }
                    }
                }
            }
        }

        // ── Main content row ───────────────────────────────────────
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // ── Entity sidebar ─────────────────────────────────────
            Rectangle {
                Layout.preferredWidth: 220
                Layout.fillHeight: true
                color: Theme.paper
                border.color: Theme.border
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 4

                    CText { variant: "h4"; text: "Entities" }
                    CText { variant: "caption"; text: "God Panel Level 3"; color: Theme.textSecondary }

                    CDivider { Layout.fillWidth: true; Layout.topMargin: 8; Layout.bottomMargin: 4 }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: entities
                        spacing: 2
                        clip: true
                        delegate: CListItem {
                            width: parent ? parent.width : 200
                            title: modelData
                            subtitle: statCount(modelData) + " records"
                            leadingIcon: entityIcons[modelData] || ""
                            selected: selectedEntity === modelData
                            onClicked: selectedEntity = modelData
                        }
                    }
                }
            }

            // ── Main data area ─────────────────────────────────────
            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: "transparent"

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    // ── Title row ──────────────────────────────────
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12
                        CText { variant: "h3"; text: (entityIcons[selectedEntity] || "") + "  " + selectedEntity + " Management" }
                        CStatusBadge {
                            status: useLiveData ? "success" : "warning"
                            text: useLiveData ? "Live" : "Mock"
                        }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Create Record"
                            variant: "primary"
                            size: "sm"
                            onClicked: {
                                editingRecord = {};
                                createDialogOpen = true;
                            }
                        }
                    }

                    // ── Search + filters ───────────────────────────
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8

                        CTextField {
                            Layout.preferredWidth: 280
                            label: "Search"
                            placeholderText: "Filter " + selectedEntity.toLowerCase() + " records..."
                            text: searchText
                            onTextChanged: { searchText = text; currentPage = 0; }
                        }

                        Item { Layout.preferredWidth: 12 }

                        Repeater {
                            model: ["All", "Active", "Inactive"]
                            delegate: CChip {
                                text: modelData
                                checked: activeFilter === modelData
                                onClicked: { activeFilter = modelData; currentPage = 0; }
                            }
                        }

                        Item { Layout.fillWidth: true }

                        CButton {
                            text: "Delete Selected"
                            variant: "danger"
                            size: "sm"
                            enabled: hasSelectedRows()
                            onClicked: deleteSelectedRows()
                        }
                    }

                    // ── Data table card ────────────────────────────
                    CCard {
                        Layout.fillWidth: true
                        Layout.fillHeight: true

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 1
                            spacing: 0

                            // ── Column headers ────────────────────
                            Rectangle {
                                Layout.fillWidth: true
                                height: 44
                                color: Theme.surface

                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: 12
                                    anchors.rightMargin: 12
                                    spacing: 0

                                    // Select All checkbox
                                    CheckBox {
                                        Layout.preferredWidth: 36
                                        checked: selectAll
                                        onCheckedChanged: {
                                            selectAll = checked;
                                            var paged = getPagedRecords();
                                            var newSel = {};
                                            for (var i = 0; i < paged.length; i++) {
                                                newSel[i] = checked;
                                            }
                                            selectedRows = newSel;
                                        }
                                    }

                                    Repeater {
                                        model: entityColumns[selectedEntity] || []
                                        delegate: CText {
                                            Layout.fillWidth: index > 0
                                            Layout.preferredWidth: index === 0 ? 80 : -1
                                            variant: "subtitle2"
                                            text: modelData
                                        }
                                    }

                                    CText {
                                        Layout.preferredWidth: 110
                                        variant: "subtitle2"
                                        text: "Actions"
                                        horizontalAlignment: Text.AlignRight
                                    }
                                }
                            }

                            CDivider { Layout.fillWidth: true }

                            // ── Data rows ─────────────────────────
                            ListView {
                                id: tableView
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                model: getPagedRecords()
                                clip: true
                                spacing: 0

                                delegate: Rectangle {
                                    id: rowDelegate
                                    width: tableView.width
                                    height: 48
                                    property var rowData: modelData
                                    property int rowIndex: index
                                    color: {
                                        if (selectedRow === rowIndex) return Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.12);
                                        if (selectedRows[rowIndex]) return Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.06);
                                        return rowIndex % 2 === 0 ? "transparent" : Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.4);
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        onClicked: selectedRow = rowDelegate.rowIndex
                                    }

                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.leftMargin: 12
                                        anchors.rightMargin: 12
                                        spacing: 0

                                        CheckBox {
                                            Layout.preferredWidth: 36
                                            checked: selectedRows[rowDelegate.rowIndex] || false
                                            onCheckedChanged: {
                                                var newSel = Object.assign({}, selectedRows);
                                                newSel[rowDelegate.rowIndex] = checked;
                                                selectedRows = newSel;
                                            }
                                        }

                                        Repeater {
                                            model: entityFields[selectedEntity] || []
                                            delegate: Item {
                                                Layout.fillWidth: index > 0
                                                Layout.preferredWidth: index === 0 ? 80 : -1
                                                implicitHeight: 48

                                                CText {
                                                    anchors.verticalCenter: parent.verticalCenter
                                                    anchors.left: parent.left
                                                    anchors.right: parent.right
                                                    variant: "body2"
                                                    text: {
                                                        var key = modelData;
                                                        var rec = rowDelegate.rowData;
                                                        return rec ? (String(rec[key] || "")) : "";
                                                    }
                                                    elide: Text.ElideRight
                                                }
                                            }
                                        }

                                        FlexRow {
                                            Layout.preferredWidth: 110
                                            Layout.alignment: Qt.AlignRight
                                            spacing: 4
                                            CButton {
                                                text: "Edit"
                                                variant: "ghost"
                                                size: "sm"
                                                onClicked: {
                                                    editingIndex = rowDelegate.rowIndex;
                                                    editingRecord = Object.assign({}, rowDelegate.rowData);
                                                    editDialogOpen = true;
                                                }
                                            }
                                            CButton {
                                                text: "Del"
                                                variant: "danger"
                                                size: "sm"
                                                onClicked: {
                                                    editingIndex = rowDelegate.rowIndex;
                                                    deleteDialogOpen = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // Empty state
                            Item {
                                Layout.fillWidth: true
                                Layout.fillHeight: totalFiltered() === 0
                                visible: totalFiltered() === 0
                                Layout.preferredHeight: visible ? 120 : 0

                                CText {
                                    anchors.centerIn: parent
                                    variant: "body1"
                                    text: "No records found"
                                    color: Theme.textSecondary
                                }
                            }

                            CDivider { Layout.fillWidth: true }

                            // ── Pagination footer ─────────────────
                            Rectangle {
                                Layout.fillWidth: true
                                height: 48
                                color: Theme.surface

                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: 16
                                    anchors.rightMargin: 16
                                    spacing: 8

                                    CText {
                                        variant: "caption"
                                        text: {
                                            var total = totalFiltered();
                                            if (total === 0) return "0 records";
                                            var start = currentPage * pageSize + 1;
                                            var end = Math.min(start + pageSize - 1, total);
                                            return start + "-" + end + " of " + total + " records";
                                        }
                                        color: Theme.textSecondary
                                    }

                                    Item { Layout.fillWidth: true }

                                    CButton {
                                        text: "Previous"
                                        variant: "ghost"
                                        size: "sm"
                                        enabled: currentPage > 0
                                        onClicked: currentPage--
                                    }

                                    CText {
                                        variant: "caption"
                                        text: "Page " + (currentPage + 1) + " of " + totalPages()
                                        color: Theme.textSecondary
                                    }

                                    CButton {
                                        text: "Next"
                                        variant: "ghost"
                                        size: "sm"
                                        enabled: currentPage < totalPages() - 1
                                        onClicked: currentPage++
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ── Form data for CRUD dialogs ───────────────────────────────
    property var createFormData: ({})
    property var editFormData: ({})

    function setCreateField(key, val) {
        var d = Object.assign({}, createFormData);
        d[key] = val;
        createFormData = d;
    }

    function setEditField(key, val) {
        var d = Object.assign({}, editFormData);
        d[key] = val;
        editFormData = d;
    }

    onCreateDialogOpenChanged: {
        if (createDialogOpen) createFormData = {};
    }

    onEditDialogOpenChanged: {
        if (editDialogOpen) {
            var d = {};
            var fields = entityFields[selectedEntity] || [];
            for (var i = 0; i < fields.length; i++) {
                d[fields[i]] = editingRecord[fields[i]] || "";
            }
            editFormData = d;
        }
    }

    // ── CRUD Dialogs ───────────────────────────────────────────────

    // Create Record Dialog
    CDialog {
        id: createDialog
        visible: createDialogOpen
        title: "Create " + selectedEntity

        ColumnLayout {
            width: 400
            spacing: 12

            Repeater {
                model: {
                    var fields = entityFields[selectedEntity] || [];
                    var cols = entityColumns[selectedEntity] || [];
                    var result = [];
                    for (var i = 1; i < fields.length; i++) {
                        result.push({ field: fields[i], label: cols[i] || fields[i] });
                    }
                    return result;
                }

                delegate: CTextField {
                    Layout.fillWidth: true
                    label: modelData.label
                    placeholderText: "Enter " + modelData.label.toLowerCase() + "..."
                    onTextChanged: setCreateField(modelData.field, text)
                }
            }

            FlexRow {
                Layout.fillWidth: true
                Layout.topMargin: 8
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    size: "sm"
                    onClicked: createDialogOpen = false
                }
                CButton {
                    text: "Create"
                    variant: "primary"
                    size: "sm"
                    onClicked: {
                        var fields = entityFields[selectedEntity];
                        var newRec = { id: generateId() };
                        for (var f = 1; f < fields.length; f++) {
                            newRec[fields[f]] = createFormData[fields[f]] || "";
                        }
                        if (!newRec.status) newRec.status = "Active";
                        if (useLiveData) {
                            dbal.create(selectedEntity, newRec, function(result, error) {
                                if (!error) {
                                    loadEntityData();
                                } else {
                                    addRecord(newRec);
                                }
                            });
                        } else {
                            addRecord(newRec);
                        }
                        createDialogOpen = false;
                    }
                }
            }
        }
    }

    // Edit Record Dialog
    CDialog {
        id: editDialog
        visible: editDialogOpen
        title: "Edit " + selectedEntity + " - " + (editingRecord.id || "")

        ColumnLayout {
            width: 400
            spacing: 12

            CText { variant: "caption"; text: "ID: " + (editingRecord.id || ""); color: Theme.textSecondary }

            Repeater {
                model: {
                    var fields = entityFields[selectedEntity] || [];
                    var cols = entityColumns[selectedEntity] || [];
                    var result = [];
                    for (var i = 1; i < fields.length; i++) {
                        result.push({ field: fields[i], label: cols[i] || fields[i], value: editingRecord[fields[i]] || "" });
                    }
                    return result;
                }

                delegate: CTextField {
                    Layout.fillWidth: true
                    label: modelData.label
                    text: modelData.value
                    placeholderText: "Enter " + modelData.label.toLowerCase() + "..."
                    onTextChanged: setEditField(modelData.field, text)
                }
            }

            FlexRow {
                Layout.fillWidth: true
                Layout.topMargin: 8
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    size: "sm"
                    onClicked: editDialogOpen = false
                }
                CButton {
                    text: "Save"
                    variant: "primary"
                    size: "sm"
                    onClicked: {
                        var fields = entityFields[selectedEntity];
                        var updatedRec = { id: editingRecord.id };
                        for (var f = 1; f < fields.length; f++) {
                            updatedRec[fields[f]] = editFormData[fields[f]] || editingRecord[fields[f]] || "";
                        }
                        if (useLiveData) {
                            dbal.update(selectedEntity, editingRecord.id, updatedRec, function(result, error) {
                                if (!error) {
                                    loadEntityData();
                                } else {
                                    updateRecord(updatedRec);
                                }
                            });
                        } else {
                            updateRecord(updatedRec);
                        }
                        editDialogOpen = false;
                    }
                }
            }
        }
    }

    // Delete Confirmation Dialog
    CDialog {
        id: deleteConfirmDialog
        visible: deleteDialogOpen
        title: "Delete " + selectedEntity

        ColumnLayout {
            width: 360
            spacing: 16

            CAlert {
                Layout.fillWidth: true
                severity: "warning"
                text: "This action cannot be undone."
            }

            CText {
                Layout.fillWidth: true
                variant: "body1"
                text: {
                    var paged = getPagedRecords();
                    var rec = paged[editingIndex];
                    if (!rec) return "Delete this record?";
                    return "Are you sure you want to delete record " + rec.id + "?";
                }
            }

            FlexRow {
                Layout.fillWidth: true
                Layout.topMargin: 8
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    size: "sm"
                    onClicked: deleteDialogOpen = false
                }
                CButton {
                    text: "Delete"
                    variant: "danger"
                    size: "sm"
                    onClicked: {
                        if (useLiveData) {
                            var paged = getPagedRecords();
                            var rec = paged[editingIndex];
                            if (rec) {
                                dbal.remove(selectedEntity, rec.id, function(result, error) {
                                    if (!error) {
                                        loadEntityData();
                                    } else {
                                        deleteRecord(editingIndex);
                                    }
                                });
                            }
                        } else {
                            deleteRecord(editingIndex);
                        }
                        deleteDialogOpen = false;
                    }
                }
            }
        }
    }
}

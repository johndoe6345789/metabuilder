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

    Component.onCompleted: { if (useLiveData) loadEntityData(); }
    onUseLiveDataChanged: { if (useLiveData) loadEntityData(); }

    // ── State ────────────────────────────────────────────────────
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

    // ── Entity definitions ───────────────────────────────────────
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

    // ── Mock data store ──────────────────────────────────────────
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

    // ── Computed helpers ──────────────────────────────────────────
    function getFilteredRecords() {
        var data = records[selectedEntity] || [];
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var rec = data[i];
            if (activeFilter === "Active" && rec.status !== "Active") continue;
            if (activeFilter === "Inactive" && rec.status !== "Inactive") continue;
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

    function totalFiltered() { return getFilteredRecords().length; }
    function totalPages() { return Math.max(1, Math.ceil(totalFiltered() / pageSize)); }
    function statCount(entity) { return (records[entity] || []).length; }

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
        var actualRec = getPagedRecords()[idx];
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === actualRec.id) { data.splice(i, 1); break; }
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
            if (data[i].id === targetId) { data[i] = rec; break; }
        }
        var updated = Object.assign({}, records);
        updated[selectedEntity] = data;
        records = updated;
    }

    function hasSelectedRows() {
        for (var key in selectedRows) { if (selectedRows[key]) return true; }
        return false;
    }

    function buildFormFields(includeValues) {
        var fields = entityFields[selectedEntity] || [];
        var cols = entityColumns[selectedEntity] || [];
        var result = [];
        for (var i = 1; i < fields.length; i++) {
            var entry = { field: fields[i], label: cols[i] || fields[i] };
            if (includeValues) entry.value = editingRecord[fields[i]] || "";
            result.push(entry);
        }
        return result;
    }

    onSelectedEntityChanged: {
        currentPage = 0; selectedRow = -1; selectedRows = {};
        selectAll = false; searchText = ""; activeFilter = "All";
        if (useLiveData) loadEntityData();
    }

    // ── Layout ───────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // ── Stats bar ────────────────────────────────────────────
        CAdminStatsBar {
            stats: [
                { label: "Total Users",     value: statCount("User"),     accent: "#4CAF50" },
                { label: "Active Sessions", value: statCount("Session"),  accent: "#2196F3" },
                { label: "Workflows",       value: statCount("Workflow"), accent: "#FF9800" },
                { label: "Audit Events",    value: statCount("AuditLog"), accent: "#9C27B0" }
            ]
        }

        // ── Main content row ─────────────────────────────────────
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // ── Entity sidebar ───────────────────────────────────
            CEntitySidebar {
                entities: root.entities
                entityIcons: root.entityIcons
                selectedEntity: root.selectedEntity
                entityCounts: {
                    var counts = {};
                    for (var i = 0; i < root.entities.length; i++) {
                        counts[root.entities[i]] = statCount(root.entities[i]);
                    }
                    return counts;
                }
                onEntitySelected: function(name) { root.selectedEntity = name; }
            }

            // ── Main data area ───────────────────────────────────
            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: Theme.background

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    // ── Title row ────────────────────────────────
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
                            onClicked: { editingRecord = {}; createDialogOpen = true; }
                        }
                    }

                    // ── Search + filters + bulk toolbar ──────────
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
                                chipColor: activeFilter === modelData ? Theme.primary : Theme.surface
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

                    // ── Data table ───────────────────────────────
                    CDataTable {
                        headers: entityColumns[selectedEntity] || []
                        fields: entityFields[selectedEntity] || []
                        rows: getPagedRecords()
                        totalFiltered: root.totalFiltered()
                        page: currentPage
                        pageSize: root.pageSize
                        selectedRow: root.selectedRow
                        selectedRows: root.selectedRows
                        selectAll: root.selectAll

                        onRowClicked: function(index) { root.selectedRow = index; }
                        onPageChanged: function(page) { root.currentPage = page; }
                        onRowSelectionChanged: function(sel) { root.selectedRows = sel; }
                        onSelectAllChanged: function(checked) { root.selectAll = checked; }
                        onEditClicked: function(index, record) {
                            editingIndex = index;
                            editingRecord = Object.assign({}, record);
                            editDialogOpen = true;
                        }
                        onDeleteClicked: function(index, record) {
                            editingIndex = index;
                            deleteDialogOpen = true;
                        }
                    }
                }
            }
        }
    }

    // ── Create dialog ────────────────────────────────────────────
    CEntityForm {
        visible: createDialogOpen
        entity: selectedEntity
        fields: buildFormFields(false)
        isEdit: false
        onSave: function(data) {
            var newRec = { id: generateId() };
            var fieldKeys = entityFields[selectedEntity];
            for (var f = 1; f < fieldKeys.length; f++) {
                newRec[fieldKeys[f]] = data[fieldKeys[f]] || "";
            }
            if (!newRec.status) newRec.status = "Active";
            if (useLiveData) {
                dbal.create(selectedEntity, newRec, function(result, error) {
                    if (!error) { loadEntityData(); } else { addRecord(newRec); }
                });
            } else {
                addRecord(newRec);
            }
            createDialogOpen = false;
        }
        onCancel: createDialogOpen = false
    }

    // ── Edit dialog ──────────────────────────────────────────────
    CEntityForm {
        visible: editDialogOpen
        entity: selectedEntity
        fields: buildFormFields(true)
        isEdit: true
        editId: editingRecord.id || ""
        onSave: function(data) {
            var updatedRec = { id: editingRecord.id };
            var fieldKeys = entityFields[selectedEntity];
            for (var f = 1; f < fieldKeys.length; f++) {
                updatedRec[fieldKeys[f]] = data[fieldKeys[f]] || editingRecord[fieldKeys[f]] || "";
            }
            if (useLiveData) {
                dbal.update(selectedEntity, editingRecord.id, updatedRec, function(result, error) {
                    if (!error) { loadEntityData(); } else { updateRecord(updatedRec); }
                });
            } else {
                updateRecord(updatedRec);
            }
            editDialogOpen = false;
        }
        onCancel: editDialogOpen = false
    }

    // ── Delete confirmation dialog ───────────────────────────────
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
                                    if (!error) { loadEntityData(); } else { deleteRecord(editingIndex); }
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

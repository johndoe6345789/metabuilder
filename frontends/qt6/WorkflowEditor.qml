import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    // ── State ──────────────────────────────────────────────────────────
    property int selectedWorkflowIndex: 0
    property int selectedNodeIndex: -1
    property bool testPanelVisible: false
    property string testInput: '{"userId": "u-42", "email": "demo@example.com"}'
    property string testOutput: ""
    property string executionStatus: ""  // "" | "running" | "success" | "failure"

    // ── Mock workflow data ─────────────────────────────────────────────
    property var workflows: [
        {
            name: "on_user_created",
            enabled: true,
            nodes: [
                { type: "Trigger",   name: "UserCreatedEvent",    config: "event: pastebin.User.created" },
                { type: "Condition", name: "CheckEmailVerified",  config: "field: email_verified == true" },
                { type: "Action",    name: "CreateDefaultNS",     config: "entity: Namespace, data: {name: 'Default'}" },
                { type: "Action",    name: "CreateExamplesNS",    config: "entity: Namespace, data: {name: 'Examples'}" },
                { type: "Lua",       name: "GenerateWelcome",     config: "script: welcome_snippet.lua" },
                { type: "Action",    name: "SendWelcomeEmail",    config: "template: welcome, to: {{user.email}}" }
            ]
        },
        {
            name: "on_login",
            enabled: true,
            nodes: [
                { type: "Trigger",   name: "LoginEvent",          config: "event: pastebin.Session.created" },
                { type: "Transform", name: "ExtractGeoIP",        config: "input: ip_address, output: geo_data" },
                { type: "Condition", name: "CheckSuspiciousIP",   config: "field: geo_data.risk_score > 0.8" },
                { type: "Action",    name: "FlagSession",         config: "entity: Session, set: {flagged: true}" },
                { type: "Action",    name: "NotifyAdmin",         config: "channel: admin, template: suspicious_login" }
            ]
        },
        {
            name: "daily_cleanup",
            enabled: true,
            nodes: [
                { type: "Trigger",   name: "CronSchedule",       config: "cron: 0 3 * * *" },
                { type: "Action",    name: "ExpireSessions",      config: "entity: Session, where: {age > 24h}" },
                { type: "Action",    name: "PurgeAuditLogs",      config: "entity: AuditLog, where: {age > 90d}" },
                { type: "Transform", name: "AggregateMetrics",    config: "group_by: day, fields: [logins, signups]" },
                { type: "Action",    name: "StoreMetrics",        config: "entity: Metric, mode: upsert" },
                { type: "Lua",       name: "CleanupReport",       config: "script: cleanup_report.lua" }
            ]
        },
        {
            name: "data_export",
            enabled: false,
            nodes: [
                { type: "Trigger",   name: "ExportRequested",     config: "event: admin.Export.requested" },
                { type: "Condition", name: "ValidatePermissions",  config: "field: user.role in [admin, god]" },
                { type: "Transform", name: "BuildQuery",          config: "template: export_query, format: csv" },
                { type: "Action",    name: "ExecuteExport",       config: "adapter: postgres, timeout: 300s" },
                { type: "Action",    name: "UploadToStorage",     config: "target: s3://exports/{{date}}" },
                { type: "Action",    name: "NotifyRequester",     config: "template: export_ready, to: {{user.email}}" }
            ]
        },
        {
            name: "notification_dispatch",
            enabled: true,
            nodes: [
                { type: "Trigger",   name: "NotificationQueued",  config: "event: system.Notification.created" },
                { type: "Transform", name: "ResolveTemplate",     config: "input: template_id, output: rendered_body" },
                { type: "Condition", name: "CheckUserPrefs",      config: "field: user.notification_prefs.{{channel}}" },
                { type: "Action",    name: "SendEmail",           config: "provider: smtp, template: {{rendered_body}}" },
                { type: "Action",    name: "SendPush",            config: "provider: fcm, payload: {{rendered_body}}" }
            ]
        }
    ]

    property var currentWorkflow: workflows[selectedWorkflowIndex]
    property var currentNode: selectedNodeIndex >= 0 ? currentWorkflow.nodes[selectedNodeIndex] : null

    // ── Node type colors ───────────────────────────────────────────────
    function nodeTypeColor(type) {
        switch (type) {
            case "Trigger":   return Theme.success
            case "Action":    return Theme.primary
            case "Condition": return Theme.warning
            case "Lua":       return "#9C27B0"
            case "Transform": return "#FF9800"
            default:          return Theme.text
        }
    }

    function nodeTypeIcon(type) {
        switch (type) {
            case "Trigger":   return "\u26A1"
            case "Action":    return "\u25B6"
            case "Condition": return "\u2753"
            case "Lua":       return "\u{1F319}"
            case "Transform": return "\u2B82"
            default:          return "\u25CF"
        }
    }

    // ── Add Node Dialog ────────────────────────────────────────────────
    property string addNodeName: ""
    property string addNodeType: "Action"
    property var nodeTypes: ["Trigger", "Action", "Condition", "Lua", "Transform"]

    CDialog {
        id: addNodeDialog
        title: "Add Node"
        width: 420
        height: 320

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 20
            spacing: 16

            CText { variant: "h4"; text: "New Workflow Node" }

            CText { variant: "body2"; text: "Node Type" }
            RowLayout {
                spacing: 8
                Repeater {
                    model: nodeTypes
                    CChip {
                        text: modelData
                        color: nodeTypeColor(modelData)
                        selected: addNodeType === modelData
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: addNodeType = modelData
                        }
                    }
                }
            }

            CText { variant: "body2"; text: "Node Name" }
            CTextField {
                Layout.fillWidth: true
                placeholderText: "Enter node name..."
                text: addNodeName
                onTextChanged: addNodeName = text
            }

            Item { Layout.fillHeight: true }

            FlexRow {
                Layout.fillWidth: true
                spacing: 8
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: addNodeDialog.close()
                }
                CButton {
                    text: "Add Node"
                    variant: "primary"
                    enabled: addNodeName.length > 0
                    onClicked: {
                        var wf = workflows[selectedWorkflowIndex]
                        wf.nodes.push({
                            type: addNodeType,
                            name: addNodeName,
                            config: "// configure " + addNodeName
                        })
                        workflows = workflows  // trigger re-bind
                        addNodeName = ""
                        addNodeType = "Action"
                        addNodeDialog.close()
                    }
                }
            }
        }
    }

    // ── Mock test execution ────────────────────────────────────────────
    Timer {
        id: executionTimer
        interval: 1800
        onTriggered: {
            var wf = currentWorkflow
            var lines = []
            lines.push("[" + Qt.formatTime(new Date(), "HH:mm:ss") + "] Workflow: " + wf.name)
            lines.push("[" + Qt.formatTime(new Date(), "HH:mm:ss") + "] Input: " + testInput)
            lines.push("")
            for (var i = 0; i < wf.nodes.length; i++) {
                var n = wf.nodes[i]
                var status = (i === 2 && !wf.enabled) ? "SKIPPED" : "OK"
                lines.push("  [" + (i + 1) + "/" + wf.nodes.length + "] " + n.type + "::" + n.name + " ... " + status)
                lines.push("        " + n.config)
            }
            lines.push("")
            if (wf.enabled) {
                lines.push("[RESULT] Workflow completed successfully. " + wf.nodes.length + " nodes executed.")
                executionStatus = "success"
            } else {
                lines.push("[RESULT] Workflow is DISABLED. Dry-run completed with warnings.")
                executionStatus = "failure"
            }
            testOutput = lines.join("\n")
        }
    }

    // ── Main Layout ────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // ── TOP BAR ────────────────────────────────────────────────────
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 56
            color: Theme.paper
            border.color: Theme.border
            border.width: 1

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                spacing: 12

                CText {
                    variant: "h3"
                    text: currentWorkflow.name
                }

                CBadge {
                    text: currentWorkflow.enabled ? "Enabled" : "Disabled"
                    accent: currentWorkflow.enabled
                }

                Item { Layout.fillWidth: true }

                CSwitch {
                    checked: currentWorkflow.enabled
                    onCheckedChanged: {
                        workflows[selectedWorkflowIndex].enabled = checked
                        workflows = workflows
                    }
                }

                CButton {
                    text: "New Workflow"
                    variant: "ghost"
                    onClicked: {
                        var newWf = {
                            name: "new_workflow_" + (workflows.length + 1),
                            enabled: false,
                            nodes: [
                                { type: "Trigger", name: "StartEvent", config: "event: custom.event" }
                            ]
                        }
                        var wfs = workflows.slice()
                        wfs.push(newWf)
                        workflows = wfs
                        selectedWorkflowIndex = wfs.length - 1
                        selectedNodeIndex = -1
                    }
                }

                CButton {
                    text: executionStatus === "running" ? "Running..." : "Run Test"
                    variant: "primary"
                    enabled: executionStatus !== "running"
                    onClicked: {
                        executionStatus = "running"
                        testOutput = "Executing workflow " + currentWorkflow.name + "..."
                        testPanelVisible = true
                        executionTimer.start()
                    }
                }
            }
        }

        // ── CONTENT ROW ────────────────────────────────────────────────
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            // ── LEFT SIDEBAR: Workflow List ─────────────────────────────
            Rectangle {
                Layout.preferredWidth: 240
                Layout.fillHeight: true
                color: Theme.paper
                border.color: Theme.border
                border.width: 1

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 12
                    spacing: 4

                    CText { variant: "h4"; text: "Workflows" }
                    CText { variant: "caption"; text: workflows.length + " registered" }

                    CDivider { Layout.fillWidth: true; Layout.topMargin: 8; Layout.bottomMargin: 4 }

                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: workflows.length
                        spacing: 2
                        clip: true
                        delegate: CListItem {
                            width: parent ? parent.width : 200
                            title: workflows[index].name
                            subtitle: workflows[index].nodes.length + " nodes"
                            selected: selectedWorkflowIndex === index
                            onClicked: {
                                selectedWorkflowIndex = index
                                selectedNodeIndex = -1
                                testOutput = ""
                                executionStatus = ""
                            }

                            CBadge {
                                anchors.right: parent.right
                                anchors.rightMargin: 8
                                anchors.verticalCenter: parent.verticalCenter
                                text: workflows[index].enabled ? "ON" : "OFF"
                                accent: workflows[index].enabled
                            }
                        }
                    }
                }
            }

            // ── CENTER: Node List ───────────────────────────────────────
            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: "transparent"

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText { variant: "h4"; text: "Nodes" }
                        CText { variant: "caption"; text: currentWorkflow.nodes.length + " steps in pipeline" }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Add Node"
                            variant: "ghost"
                            onClicked: {
                                addNodeName = ""
                                addNodeType = "Action"
                                addNodeDialog.open()
                            }
                        }
                    }

                    // Execution status alert
                    Loader {
                        Layout.fillWidth: true
                        active: executionStatus === "success" || executionStatus === "failure"
                        sourceComponent: CAlert {
                            severity: executionStatus === "success" ? "success" : "error"
                            text: executionStatus === "success"
                                ? "Last test run completed successfully."
                                : "Last test run completed with warnings or errors."
                        }
                    }

                    // Node cards
                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: currentWorkflow.nodes.length
                        spacing: 6
                        clip: true
                        delegate: Item {
                            width: parent ? parent.width : 400
                            height: 72

                            // Connector line to next node
                            Rectangle {
                                visible: index < currentWorkflow.nodes.length - 1
                                width: 2
                                height: 8
                                color: Theme.border
                                anchors.horizontalCenter: nodeCard.horizontalCenter
                                anchors.top: nodeCard.bottom
                                anchors.horizontalCenterOffset: -nodeCard.width / 2 + 28
                            }

                            CCard {
                                id: nodeCard
                                anchors.fill: parent
                                property var nodeData: currentWorkflow.nodes[index]
                                property bool isSelected: selectedNodeIndex === index

                                Rectangle {
                                    anchors.fill: parent
                                    radius: 6
                                    color: nodeCard.isSelected ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.08) : "transparent"
                                    border.color: nodeCard.isSelected ? Theme.primary : Theme.border
                                    border.width: nodeCard.isSelected ? 2 : 1

                                    RowLayout {
                                        anchors.fill: parent
                                        anchors.margins: 12
                                        spacing: 12

                                        // Step number
                                        Rectangle {
                                            Layout.preferredWidth: 32
                                            Layout.preferredHeight: 32
                                            radius: 16
                                            color: nodeTypeColor(nodeCard.nodeData.type)

                                            CText {
                                                anchors.centerIn: parent
                                                text: (index + 1).toString()
                                                color: "#FFFFFF"
                                                variant: "body2"
                                                font.bold: true
                                            }
                                        }

                                        // Node info
                                        ColumnLayout {
                                            Layout.fillWidth: true
                                            spacing: 2
                                            CText {
                                                variant: "body1"
                                                text: nodeCard.nodeData.name
                                                font.bold: true
                                            }
                                            CText {
                                                variant: "caption"
                                                text: nodeCard.nodeData.config
                                                elide: Text.ElideRight
                                                Layout.fillWidth: true
                                            }
                                        }

                                        // Type chip
                                        CChip {
                                            text: nodeCard.nodeData.type
                                            color: nodeTypeColor(nodeCard.nodeData.type)
                                        }

                                        // Delete button
                                        CButton {
                                            text: "X"
                                            variant: "danger"
                                            size: "sm"
                                            visible: nodeCard.isSelected
                                            onClicked: {
                                                var wf = workflows[selectedWorkflowIndex]
                                                wf.nodes.splice(index, 1)
                                                workflows = workflows
                                                selectedNodeIndex = -1
                                            }
                                        }
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        z: -1
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: selectedNodeIndex = (selectedNodeIndex === index) ? -1 : index
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── RIGHT: Node Config Panel ────────────────────────────────
            Rectangle {
                Layout.preferredWidth: selectedNodeIndex >= 0 ? 300 : 0
                Layout.fillHeight: true
                color: Theme.paper
                border.color: Theme.border
                border.width: selectedNodeIndex >= 0 ? 1 : 0
                clip: true
                visible: selectedNodeIndex >= 0

                Behavior on Layout.preferredWidth { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12
                    visible: currentNode !== null

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText { variant: "h4"; text: "Node Config" }
                        Item { Layout.fillWidth: true }
                        CButton {
                            text: "Close"
                            variant: "ghost"
                            size: "sm"
                            onClicked: selectedNodeIndex = -1
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Node type display
                    CText { variant: "body2"; text: "Type" }
                    CChip {
                        text: currentNode ? currentNode.type : ""
                        color: currentNode ? nodeTypeColor(currentNode.type) : Theme.text
                    }

                    // Node name field
                    CText { variant: "body2"; text: "Name" }
                    CTextField {
                        Layout.fillWidth: true
                        text: currentNode ? currentNode.name : ""
                        onTextChanged: {
                            if (currentNode && text !== currentNode.name) {
                                workflows[selectedWorkflowIndex].nodes[selectedNodeIndex].name = text
                                workflows = workflows
                            }
                        }
                    }

                    // Config field
                    CText { variant: "body2"; text: "Configuration" }
                    CTextField {
                        Layout.fillWidth: true
                        text: currentNode ? currentNode.config : ""
                        onTextChanged: {
                            if (currentNode && text !== currentNode.config) {
                                workflows[selectedWorkflowIndex].nodes[selectedNodeIndex].config = text
                                workflows = workflows
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    // Type-specific fields
                    CText { variant: "body2"; text: "Type-Specific Settings"; font.bold: true }

                    // Trigger-specific
                    Loader {
                        Layout.fillWidth: true
                        active: currentNode !== null && currentNode.type === "Trigger"
                        sourceComponent: ColumnLayout {
                            spacing: 8
                            CText { variant: "caption"; text: "Event Source" }
                            CSelect {
                                Layout.fillWidth: true
                                model: ["pastebin.User.created", "pastebin.Session.created", "admin.Export.requested", "system.Notification.created", "cron"]
                            }
                            CText { variant: "caption"; text: "Debounce (ms)" }
                            CTextField { Layout.fillWidth: true; placeholderText: "0"; text: "0" }
                        }
                    }

                    // Action-specific
                    Loader {
                        Layout.fillWidth: true
                        active: currentNode !== null && currentNode.type === "Action"
                        sourceComponent: ColumnLayout {
                            spacing: 8
                            CText { variant: "caption"; text: "Target Entity" }
                            CSelect {
                                Layout.fillWidth: true
                                model: ["User", "Session", "Namespace", "Snippet", "AuditLog", "Notification", "Metric"]
                            }
                            CText { variant: "caption"; text: "Operation" }
                            CSelect {
                                Layout.fillWidth: true
                                model: ["create", "update", "delete", "upsert", "send"]
                            }
                        }
                    }

                    // Condition-specific
                    Loader {
                        Layout.fillWidth: true
                        active: currentNode !== null && currentNode.type === "Condition"
                        sourceComponent: ColumnLayout {
                            spacing: 8
                            CText { variant: "caption"; text: "Field" }
                            CTextField { Layout.fillWidth: true; placeholderText: "e.g. user.role" }
                            CText { variant: "caption"; text: "Operator" }
                            CSelect {
                                Layout.fillWidth: true
                                model: ["==", "!=", ">", "<", ">=", "<=", "in", "not_in", "contains"]
                            }
                            CText { variant: "caption"; text: "Value" }
                            CTextField { Layout.fillWidth: true; placeholderText: "e.g. admin" }
                        }
                    }

                    // Lua-specific
                    Loader {
                        Layout.fillWidth: true
                        active: currentNode !== null && currentNode.type === "Lua"
                        sourceComponent: ColumnLayout {
                            spacing: 8
                            CText { variant: "caption"; text: "Script File" }
                            CTextField { Layout.fillWidth: true; placeholderText: "script.lua" }
                            CText { variant: "caption"; text: "Entry Function" }
                            CTextField { Layout.fillWidth: true; placeholderText: "main"; text: "main" }
                            CText { variant: "caption"; text: "Timeout (sec)" }
                            CTextField { Layout.fillWidth: true; text: "30" }
                        }
                    }

                    // Transform-specific
                    Loader {
                        Layout.fillWidth: true
                        active: currentNode !== null && currentNode.type === "Transform"
                        sourceComponent: ColumnLayout {
                            spacing: 8
                            CText { variant: "caption"; text: "Input Field" }
                            CTextField { Layout.fillWidth: true; placeholderText: "e.g. raw_data" }
                            CText { variant: "caption"; text: "Output Field" }
                            CTextField { Layout.fillWidth: true; placeholderText: "e.g. transformed" }
                            CText { variant: "caption"; text: "Format" }
                            CSelect {
                                Layout.fillWidth: true
                                model: ["json", "csv", "xml", "yaml", "text"]
                            }
                        }
                    }

                    Item { Layout.fillHeight: true }
                }
            }
        }

        // ── BOTTOM: Test Execution Panel ────────────────────────────────
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: testPanelVisible ? 220 : 36
            color: Theme.paper
            border.color: Theme.border
            border.width: 1
            clip: true

            Behavior on Layout.preferredHeight { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 8

                // Toggle header
                FlexRow {
                    Layout.fillWidth: true
                    spacing: 8

                    CText {
                        variant: "body2"
                        text: "Test Execution"
                        font.bold: true
                    }

                    // Status indicator
                    Rectangle {
                        width: 10
                        height: 10
                        radius: 5
                        visible: executionStatus !== ""
                        color: {
                            if (executionStatus === "running") return Theme.warning
                            if (executionStatus === "success") return Theme.success
                            if (executionStatus === "failure") return Theme.error
                            return "transparent"
                        }
                    }
                    CText {
                        variant: "caption"
                        visible: executionStatus !== ""
                        text: {
                            if (executionStatus === "running") return "Running..."
                            if (executionStatus === "success") return "Passed"
                            if (executionStatus === "failure") return "Warning"
                            return ""
                        }
                    }

                    Item { Layout.fillWidth: true }

                    CButton {
                        text: testPanelVisible ? "Hide" : "Show"
                        variant: "ghost"
                        size: "sm"
                        onClicked: testPanelVisible = !testPanelVisible
                    }
                }

                // Test content (visible when expanded)
                RowLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 12
                    visible: testPanelVisible

                    // Input side
                    ColumnLayout {
                        Layout.preferredWidth: 300
                        Layout.fillHeight: true
                        spacing: 6

                        CText { variant: "caption"; text: "Test Input (JSON)" }
                        CTextField {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            text: testInput
                            onTextChanged: testInput = text
                        }
                        CButton {
                            text: executionStatus === "running" ? "Executing..." : "Execute"
                            variant: "primary"
                            enabled: executionStatus !== "running"
                            onClicked: {
                                executionStatus = "running"
                                testOutput = "Executing workflow " + currentWorkflow.name + "..."
                                executionTimer.start()
                            }
                        }
                    }

                    // Output side
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        spacing: 6

                        CText { variant: "caption"; text: "Output Log" }
                        Rectangle {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            color: Theme.surface
                            radius: 4
                            border.color: Theme.border
                            border.width: 1

                            ScrollView {
                                anchors.fill: parent
                                anchors.margins: 8

                                Text {
                                    width: parent.width
                                    text: testOutput
                                    color: Theme.text
                                    font.family: "monospace"
                                    font.pixelSize: 11
                                    wrapMode: Text.WrapAnywhere
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

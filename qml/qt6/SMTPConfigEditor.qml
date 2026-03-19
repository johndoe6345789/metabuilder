import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"

Rectangle {
    id: smtpEditor
    color: "transparent"

    // ── SMTP Server Config ──
    property string smtpHost: "smtp.example.com"
    property string smtpPort: "587"
    property string smtpUsername: ""
    property string smtpPassword: ""
    property int encryptionIndex: 1
    property var encryptionOptions: ["None", "TLS", "SSL"]

    // ── Sender Config ──
    property string fromName: "MetaBuilder"
    property string fromEmail: "noreply@example.com"

    // ── Connection Status ──
    property string connectionStatus: "untested"
    property string lastTestResult: ""
    property string lastTestTime: ""

    // ── Test Email ──
    property string testRecipient: ""
    property string testSubject: "MetaBuilder SMTP Test"
    property string testBody: "This is a test email from MetaBuilder."
    property bool sendingTest: false

    // ── Templates ──
    property int selectedTemplateIndex: -1
    property var emailTemplates: [
        { id: "welcome_email",  name: "Welcome Email",  subject: "Welcome to {{app_name}}, {{user_name}}!", body: "Hi {{user_name}},\n\nWelcome to {{app_name}}! Your account has been created successfully.\n\nYour username: {{username}}\n\nGet started by visiting your dashboard.\n\nBest regards,\nThe {{app_name}} Team" },
        { id: "password_reset", name: "Password Reset",  subject: "Password Reset Request - {{app_name}}", body: "Hi {{user_name}},\n\nWe received a request to reset your password.\n\nClick the link below to set a new password:\n{{reset_link}}\n\nThis link expires in {{expiry_minutes}} minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe {{app_name}} Team" },
        { id: "notification",   name: "Notification",    subject: "[{{app_name}}] {{notification_title}}", body: "Hi {{user_name}},\n\n{{notification_body}}\n\nView details: {{action_url}}\n\nBest regards,\nThe {{app_name}} Team" },
        { id: "invite",         name: "Invite",          subject: "You've been invited to {{app_name}}", body: "Hi,\n\n{{inviter_name}} has invited you to join {{app_name}}.\n\nClick below to accept your invitation:\n{{invite_link}}\n\nThis invitation expires on {{expiry_date}}.\n\nBest regards,\nThe {{app_name}} Team" }
    ]

    property string editTemplateName: ""
    property string editTemplateSubject: ""
    property string editTemplateBody: ""
    property bool isDirty: false

    function markDirty() { isDirty = true }

    function testConnection() {
        connectionStatus = "testing"; lastTestResult = ""; connectionTimer.start()
    }

    Timer {
        id: connectionTimer; interval: 1500; repeat: false
        onTriggered: {
            var success = smtpHost.length > 0 && smtpPort.length > 0
            connectionStatus = success ? "success" : "failed"
            lastTestResult = success ? "Connected to " + smtpHost + ":" + smtpPort + " via " + encryptionOptions[encryptionIndex] : "Failed to connect. Check host and port."
            lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
        }
    }

    function sendTestEmail() {
        if (testRecipient.length === 0) return; sendingTest = true; sendTestTimer.start()
    }

    Timer {
        id: sendTestTimer; interval: 2000; repeat: false
        onTriggered: { sendingTest = false; lastTestResult = "Test email sent to " + testRecipient; lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss") }
    }

    function selectTemplate(index) {
        selectedTemplateIndex = index
        if (index >= 0 && index < emailTemplates.length) {
            var tpl = emailTemplates[index]; editTemplateName = tpl.name; editTemplateSubject = tpl.subject; editTemplateBody = tpl.body
        }
    }

    function saveTemplate() {
        if (selectedTemplateIndex < 0) return
        var updated = emailTemplates.slice()
        updated[selectedTemplateIndex] = { id: updated[selectedTemplateIndex].id, name: editTemplateName, subject: editTemplateSubject, body: editTemplateBody }
        emailTemplates = updated
    }

    function saveAll() { saveTemplate(); isDirty = false; lastTestResult = "Configuration saved."; lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss") }

    function resetAll() {
        smtpHost = "smtp.example.com"; smtpPort = "587"; smtpUsername = ""; smtpPassword = ""; encryptionIndex = 1
        fromName = "MetaBuilder"; fromEmail = "noreply@example.com"; testRecipient = ""; testSubject = "MetaBuilder SMTP Test"
        testBody = "This is a test email from MetaBuilder."; connectionStatus = "untested"; lastTestResult = ""; lastTestTime = ""; selectedTemplateIndex = -1; isDirty = false
    }

    // ── UI ───────────────────────────────────────────────────────
    ScrollView {
        anchors.fill: parent; contentWidth: availableWidth; clip: true

        ColumnLayout {
            width: parent.width; spacing: 16

            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CText { variant: "h3"; text: "SMTP Configuration" }
                CBadge { text: "Email" }
                Item { Layout.fillWidth: true }
                CButton { text: "Reset"; variant: "ghost"; size: "sm"; onClicked: resetAll() }
                CButton { text: "Save Configuration"; variant: "primary"; size: "sm"; onClicked: saveAll() }
            }

            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 12
                    CText { variant: "h4"; text: "Status" }
                    FlexRow {
                        Layout.fillWidth: true; spacing: 16
                        CStatusBadge {
                            status: connectionStatus === "success" ? "success" : connectionStatus === "failed" ? "error" : connectionStatus === "testing" ? "warning" : "info"
                            text: connectionStatus === "success" ? "Connected" : connectionStatus === "failed" ? "Failed" : connectionStatus === "testing" ? "Testing..." : "Not Tested"
                        }
                        CStatusBadge { status: isDirty ? "warning" : "success"; text: isDirty ? "Unsaved Changes" : "Saved" }
                    }
                    CText { visible: lastTestResult.length > 0; variant: "body2"; text: lastTestResult }
                    CText { visible: lastTestTime.length > 0; variant: "caption"; text: "Last activity: " + lastTestTime }
                }
            }

            RowLayout {
                Layout.fillWidth: true; spacing: 16

                CSmtpServerForm {
                    host: smtpHost; port: smtpPort; username: smtpUsername; password: smtpPassword
                    encryptionIndex: smtpEditor.encryptionIndex; encryptionOptions: smtpEditor.encryptionOptions; connectionStatus: smtpEditor.connectionStatus
                    onHostEdited: function(v) { smtpHost = v; markDirty() }
                    onPortEdited: function(v) { smtpPort = v; markDirty() }
                    onUsernameEdited: function(v) { smtpUsername = v; markDirty() }
                    onPasswordEdited: function(v) { smtpPassword = v; markDirty() }
                    onEncryptionEdited: function(i) { encryptionIndex = i; markDirty() }
                    onTestRequested: testConnection()
                }

                CSmtpSenderForm {
                    fromName: smtpEditor.fromName; fromEmail: smtpEditor.fromEmail
                    onFromNameEdited: function(v) { smtpEditor.fromName = v; markDirty() }
                    onFromEmailEdited: function(v) { smtpEditor.fromEmail = v; markDirty() }
                }
            }

            CSmtpTestEmailForm {
                recipient: testRecipient; subject: testSubject; body: testBody; sending: sendingTest
                onRecipientEdited: function(v) { testRecipient = v }
                onSubjectEdited: function(v) { testSubject = v }
                onBodyEdited: function(v) { testBody = v }
                onSendRequested: sendTestEmail()
            }

            RowLayout {
                Layout.fillWidth: true; spacing: 16

                CSmtpTemplateList {
                    templates: emailTemplates; selectedIndex: selectedTemplateIndex
                    onTemplateSelected: function(i) { selectTemplate(i) }
                }

                CSmtpTemplateEditor {
                    hasSelection: selectedTemplateIndex >= 0
                    templateName: editTemplateName; templateSubject: editTemplateSubject; templateBody: editTemplateBody
                    onNameChanged: function(v) { editTemplateName = v }
                    onSubjectChanged: function(v) { editTemplateSubject = v }
                    onBodyChanged: function(v) { editTemplateBody = v }
                    onSaveRequested: { saveTemplate(); markDirty() }
                }
            }

            Item { Layout.preferredHeight: 8 }
        }
    }
}

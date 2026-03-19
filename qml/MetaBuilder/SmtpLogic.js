// SmtpLogic.js — business logic for SMTPConfigEditor

function connBadgeStatus(cs) {
    if (cs === "success") return "success";
    if (cs === "failed") return "error";
    if (cs === "testing") return "warning";
    return "info";
}

function connBadgeText(cs) {
    if (cs === "success") return "Connected";
    if (cs === "failed") return "Failed";
    if (cs === "testing") return "Testing...";
    return "Not Tested";
}

function testConnection(root, connectionTimer) {
    root.connectionStatus = "testing"
    root.lastTestResult = ""
    connectionTimer.start()
}

function onConnectionTestComplete(root) {
    var success = root.smtpHost.length > 0 && root.smtpPort.length > 0
    root.connectionStatus = success ? "success" : "failed"
    root.lastTestResult = success
        ? "Connected to " + root.smtpHost + ":" + root.smtpPort + " via " +
            root.encryptionOptions[root.encryptionIndex]
        : "Failed to connect. Check host and port."
    root.lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
}

function sendTestEmail(root, sendTestTimer) {
    if (root.testRecipient.length === 0) return
    root.sendingTest = true; sendTestTimer.start()
}

function onSendTestComplete(root) {
    root.sendingTest = false
    root.lastTestResult = "Test email sent to " + root.testRecipient
    root.lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
}

function selectTemplate(root, index) {
    root.selectedTemplateIndex = index
    if (index >= 0 && index < root.emailTemplates.length) {
        var tpl = root.emailTemplates[index]
        root.editTemplateName = tpl.name
        root.editTemplateSubject = tpl.subject
        root.editTemplateBody = tpl.body
    }
}

function saveTemplate(root) {
    if (root.selectedTemplateIndex < 0) return
    var updated = root.emailTemplates.slice()
    updated[root.selectedTemplateIndex] = {
        id: updated[root.selectedTemplateIndex].id,
        name: root.editTemplateName,
        subject: root.editTemplateSubject,
        body: root.editTemplateBody
    }
    root.emailTemplates = updated
}

function saveAll(root) {
    saveTemplate(root)
    root.isDirty = false
    root.lastTestResult = "Configuration saved."
    root.lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss")
}

function resetAll(root) {
    root.smtpHost = "smtp.example.com"; root.smtpPort = "587"
    root.smtpUsername = ""; root.smtpPassword = ""; root.encryptionIndex = 1
    root.fromName = "MetaBuilder"; root.fromEmail = "noreply@example.com"
    root.testRecipient = ""; root.testSubject = "MetaBuilder SMTP Test"
    root.testBody = "This is a test email from MetaBuilder."
    root.connectionStatus = "untested"; root.lastTestResult = ""
    root.lastTestTime = ""; root.selectedTemplateIndex = -1
    root.isDirty = false
}

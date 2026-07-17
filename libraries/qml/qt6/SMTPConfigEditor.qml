import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/SmtpLogic.js" as Logic
Rectangle {
    id: se; color: "transparent"
    objectName: "view_smtp_config"
    Accessible.role: Accessible.Pane
    Accessible.name: "SMTP Configuration"
    property string smtpHost: "smtp.example.com"
    property string smtpPort: "587"
    property string smtpUsername: ""; property string smtpPassword: ""
    property int encryptionIndex: 1; property var encryptionOptions: []
    property string fromName: "MetaBuilder"
    property string fromEmail: "noreply@example.com"
    property string connectionStatus: "untested"
    property string lastTestResult: ""; property string lastTestTime: ""
    property string testRecipient: ""
    property string testSubject: "MetaBuilder SMTP Test"
    property string testBody: "This is a test email from MetaBuilder."
    property bool sendingTest: false
    property int selectedTemplateIndex: -1; property var emailTemplates: []
    property string editTplName: ""; property string editTplSubj: ""
    property string editTplBody: ""
    property bool isDirty: false
    function loadSeedData() {
        var xhr = new XMLHttpRequest()
        try {
            xhr.open("GET", Qt.resolvedUrl(
                "config/smtp-templates.json"), false)
            xhr.send()
            if (xhr.status === 200 || xhr.status === 0) {
                var d = JSON.parse(xhr.responseText)
                emailTemplates = d.emailTemplates
                encryptionOptions = d.encryptionOptions }
        } catch(e) {}
    }
    Component.onCompleted: loadSeedData()
    Timer { id: connTimer; interval: 1500; repeat: false
        onTriggered: Logic.onConnectionTestComplete(se) }
    Timer { id: sendTimer; interval: 2000; repeat: false
        onTriggered: Logic.onSendTestComplete(se) }
    ScrollView {
        anchors.fill: parent; contentWidth: availableWidth; clip: true
        ColumnLayout {
            width: parent.width; spacing: 16
            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CText { variant: "h3"; text: "SMTP Configuration" }
                CBadge { text: "Email" }
                Item { Layout.fillWidth: true }
                CButton { text: "Reset"
                    variant: "ghost"; size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Reset SMTP settings"
                    Keys.onReturnPressed:
                        Logic.resetAll(se)
                    onClicked: Logic.resetAll(se) }
                CButton { text: "Save Configuration"
                    variant: "primary"; size: "sm"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name:
                        "Save SMTP configuration"
                    Keys.onReturnPressed:
                        Logic.saveAll(se)
                    onClicked: Logic.saveAll(se) }
            }
            CCard {
                Layout.fillWidth: true
                ColumnLayout {
                    Layout.fillWidth: true; spacing: 12
                    CText { variant: "h4"; text: "Status" }
                    FlexRow {
                        Layout.fillWidth: true; spacing: 16
                        CStatusBadge {
                            status: Logic.connBadgeStatus(connectionStatus)
                            text: Logic.connBadgeText(connectionStatus) }
                        CStatusBadge {
                            status: isDirty ? "warning" : "success"
                            text: isDirty ? "Unsaved Changes" : "Saved" }
                    }
                    CText { visible: lastTestResult.length > 0
                        variant: "body2"; text: lastTestResult }
                    CText { visible: lastTestTime.length > 0; variant: "caption"
                        text: "Last activity: " + lastTestTime }
                }
            }
            RowLayout {
                Layout.fillWidth: true; spacing: 16
                CSmtpServerForm {
                    host: smtpHost; port: smtpPort
                    username: smtpUsername; password: smtpPassword
                    encryptionIndex: se.encryptionIndex
                    encryptionOptions: se.encryptionOptions
                    connectionStatus: se.connectionStatus
                    onHostEdited: function(v) { smtpHost = v; isDirty = true }
                    onPortEdited: function(v) { smtpPort = v; isDirty = true }
                    onUsernameEdited: function(v) {
                        smtpUsername = v; isDirty = true
                    }
                    onPasswordEdited: function(v) {
                        smtpPassword = v; isDirty = true
                    }
                    onEncryptionEdited: function(i) {
                        encryptionIndex = i; isDirty = true
                    }
                    onTestRequested: Logic.testConnection(se, connTimer)
                }
                CSmtpSenderForm {
                    fromName: se.fromName; fromEmail: se.fromEmail
                    onFromNameEdited: function(v) {
                        se.fromName = v; isDirty = true
                    }
                    onFromEmailEdited: function(v) {
                        se.fromEmail = v; isDirty = true
                    }
                }
            }
            CSmtpTestEmailForm {
                recipient: testRecipient; subject: testSubject
                body: testBody; sending: sendingTest
                onRecipientEdited: function(v) { testRecipient = v }
                onSubjectEdited: function(v) { testSubject = v }
                onBodyEdited: function(v) { testBody = v }
                onSendRequested: Logic.sendTestEmail(se, sendTimer)
            }
            RowLayout {
                Layout.fillWidth: true; spacing: 16
                CSmtpTemplateList {
                    templates: emailTemplates
                    selectedIndex: selectedTemplateIndex
                    onTemplateSelected: function(i) {
                        Logic.selectTemplate(se, i) } }
                CSmtpTemplateEditor {
                    hasSelection: selectedTemplateIndex >= 0
                    templateName: editTplName; templateSubject: editTplSubj
                    templateBody: editTplBody
                    onNameChanged: function(v) { editTplName = v }
                    onSubjectChanged: function(v) { editTplSubj = v }
                    onBodyChanged: function(v) { editTplBody = v }
                    onSaveRequested: { Logic.saveTemplate(se); isDirty = true }
                }
            }
            Item { Layout.preferredHeight: 8 }
        }
    }
}

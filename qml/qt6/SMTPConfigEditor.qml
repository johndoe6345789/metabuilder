import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "../MetaBuilder/SmtpLogic.js" as Logic

Rectangle {
    id: smtpEditor
    color: "transparent"

    property string smtpHost: "smtp.example.com"
    property string smtpPort: "587"
    property string smtpUsername: ""
    property string smtpPassword: ""
    property int encryptionIndex: 1
    property var encryptionOptions: []
    property string fromName: "MetaBuilder"
    property string fromEmail: "noreply@example.com"
    property string connectionStatus: "untested"
    property string lastTestResult: ""
    property string lastTestTime: ""
    property string testRecipient: ""
    property string testSubject: "MetaBuilder SMTP Test"
    property string testBody: "This is a test email from MetaBuilder."
    property bool sendingTest: false
    property int selectedTemplateIndex: -1
    property var emailTemplates: []
    property string editTemplateName: ""
    property string editTemplateSubject: ""
    property string editTemplateBody: ""
    property bool isDirty: false

    function loadSeedData() {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", Qt.resolvedUrl("config/smtp-templates.json"), false); xhr.send()
        if (xhr.status === 200) { var d = JSON.parse(xhr.responseText); emailTemplates = d.emailTemplates; encryptionOptions = d.encryptionOptions }
    }

    Component.onCompleted: loadSeedData()

    Timer { id: connectionTimer; interval: 1500; repeat: false; onTriggered: Logic.onConnectionTestComplete(smtpEditor) }
    Timer { id: sendTestTimer; interval: 2000; repeat: false; onTriggered: Logic.onSendTestComplete(smtpEditor) }

    ScrollView {
        anchors.fill: parent; contentWidth: availableWidth; clip: true
        ColumnLayout {
            width: parent.width; spacing: 16
            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CText { variant: "h3"; text: "SMTP Configuration" }
                CBadge { text: "Email" }
                Item { Layout.fillWidth: true }
                CButton { text: "Reset"; variant: "ghost"; size: "sm"; onClicked: Logic.resetAll(smtpEditor) }
                CButton { text: "Save Configuration"; variant: "primary"; size: "sm"; onClicked: Logic.saveAll(smtpEditor) }
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
                    onHostEdited: function(v) { smtpHost = v; isDirty = true }; onPortEdited: function(v) { smtpPort = v; isDirty = true }
                    onUsernameEdited: function(v) { smtpUsername = v; isDirty = true }; onPasswordEdited: function(v) { smtpPassword = v; isDirty = true }
                    onEncryptionEdited: function(i) { encryptionIndex = i; isDirty = true }; onTestRequested: Logic.testConnection(smtpEditor, connectionTimer)
                }
                CSmtpSenderForm {
                    fromName: smtpEditor.fromName; fromEmail: smtpEditor.fromEmail
                    onFromNameEdited: function(v) { smtpEditor.fromName = v; isDirty = true }; onFromEmailEdited: function(v) { smtpEditor.fromEmail = v; isDirty = true }
                }
            }
            CSmtpTestEmailForm {
                recipient: testRecipient; subject: testSubject; body: testBody; sending: sendingTest
                onRecipientEdited: function(v) { testRecipient = v }; onSubjectEdited: function(v) { testSubject = v }
                onBodyEdited: function(v) { testBody = v }; onSendRequested: Logic.sendTestEmail(smtpEditor, sendTestTimer)
            }
            RowLayout {
                Layout.fillWidth: true; spacing: 16
                CSmtpTemplateList { templates: emailTemplates; selectedIndex: selectedTemplateIndex; onTemplateSelected: function(i) { Logic.selectTemplate(smtpEditor, i) } }
                CSmtpTemplateEditor {
                    hasSelection: selectedTemplateIndex >= 0; templateName: editTemplateName; templateSubject: editTemplateSubject; templateBody: editTemplateBody
                    onNameChanged: function(v) { editTemplateName = v }; onSubjectChanged: function(v) { editTemplateSubject = v }; onBodyChanged: function(v) { editTemplateBody = v }
                    onSaveRequested: { Logic.saveTemplate(smtpEditor); isDirty = true }
                }
            }
            Item { Layout.preferredHeight: 8 }
        }
    }
}

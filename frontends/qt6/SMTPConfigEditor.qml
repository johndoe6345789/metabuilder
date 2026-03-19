import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: smtpEditor
    color: "transparent"

    // ── SMTP Server Config ──
    property string smtpHost: "smtp.example.com"
    property string smtpPort: "587"
    property string smtpUsername: ""
    property string smtpPassword: ""
    property int encryptionIndex: 1  // 0=None, 1=TLS, 2=SSL
    property var encryptionOptions: ["None", "TLS", "SSL"]

    // ── Sender Config ──
    property string fromName: "MetaBuilder"
    property string fromEmail: "noreply@example.com"

    // ── Connection Status ──
    property string connectionStatus: "untested"  // untested, testing, success, failed
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
        {
            id: "welcome_email",
            name: "Welcome Email",
            subject: "Welcome to {{app_name}}, {{user_name}}!",
            body: "Hi {{user_name}},\n\nWelcome to {{app_name}}! Your account has been created successfully.\n\nYour username: {{username}}\n\nGet started by visiting your dashboard.\n\nBest regards,\nThe {{app_name}} Team"
        },
        {
            id: "password_reset",
            name: "Password Reset",
            subject: "Password Reset Request - {{app_name}}",
            body: "Hi {{user_name}},\n\nWe received a request to reset your password.\n\nClick the link below to set a new password:\n{{reset_link}}\n\nThis link expires in {{expiry_minutes}} minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe {{app_name}} Team"
        },
        {
            id: "notification",
            name: "Notification",
            subject: "[{{app_name}}] {{notification_title}}",
            body: "Hi {{user_name}},\n\n{{notification_body}}\n\nView details: {{action_url}}\n\nBest regards,\nThe {{app_name}} Team"
        },
        {
            id: "invite",
            name: "Invite",
            subject: "You've been invited to {{app_name}}",
            body: "Hi,\n\n{{inviter_name}} has invited you to join {{app_name}}.\n\nClick below to accept your invitation:\n{{invite_link}}\n\nThis invitation expires on {{expiry_date}}.\n\nBest regards,\nThe {{app_name}} Team"
        }
    ]

    // ── Edited template state ──
    property string editTemplateName: ""
    property string editTemplateSubject: ""
    property string editTemplateBody: ""

    // ── Dirty tracking ──
    property bool isDirty: false

    function markDirty() {
        isDirty = true;
    }

    function testConnection() {
        connectionStatus = "testing";
        lastTestResult = "";
        // Simulate async connection test
        connectionTimer.start();
    }

    Timer {
        id: connectionTimer
        interval: 1500
        repeat: false
        onTriggered: {
            var success = smtpHost.length > 0 && smtpPort.length > 0;
            connectionStatus = success ? "success" : "failed";
            lastTestResult = success
                ? "Connected to " + smtpHost + ":" + smtpPort + " via " + encryptionOptions[encryptionIndex]
                : "Failed to connect. Check host and port.";
            lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss");
        }
    }

    function sendTestEmail() {
        if (testRecipient.length === 0) return;
        sendingTest = true;
        sendTestTimer.start();
    }

    Timer {
        id: sendTestTimer
        interval: 2000
        repeat: false
        onTriggered: {
            sendingTest = false;
            lastTestResult = "Test email sent to " + testRecipient;
            lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss");
        }
    }

    function selectTemplate(index) {
        selectedTemplateIndex = index;
        if (index >= 0 && index < emailTemplates.length) {
            var tpl = emailTemplates[index];
            editTemplateName = tpl.name;
            editTemplateSubject = tpl.subject;
            editTemplateBody = tpl.body;
        }
    }

    function saveTemplate() {
        if (selectedTemplateIndex < 0) return;
        var updated = emailTemplates.slice();
        updated[selectedTemplateIndex] = {
            id: updated[selectedTemplateIndex].id,
            name: editTemplateName,
            subject: editTemplateSubject,
            body: editTemplateBody
        };
        emailTemplates = updated;
    }

    function saveAll() {
        saveTemplate();
        isDirty = false;
        lastTestResult = "Configuration saved.";
        lastTestTime = Qt.formatDateTime(new Date(), "yyyy-MM-dd hh:mm:ss");
    }

    function resetAll() {
        smtpHost = "smtp.example.com";
        smtpPort = "587";
        smtpUsername = "";
        smtpPassword = "";
        encryptionIndex = 1;
        fromName = "MetaBuilder";
        fromEmail = "noreply@example.com";
        testRecipient = "";
        testSubject = "MetaBuilder SMTP Test";
        testBody = "This is a test email from MetaBuilder.";
        connectionStatus = "untested";
        lastTestResult = "";
        lastTestTime = "";
        selectedTemplateIndex = -1;
        isDirty = false;
    }

    ScrollView {
        anchors.fill: parent
        contentWidth: availableWidth
        clip: true

        ColumnLayout {
            width: parent.width
            spacing: 16

            // ══════════════════════════════════════════
            // Header
            // ══════════════════════════════════════════
            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CText { variant: "h3"; text: "SMTP Configuration" }
                CBadge { text: "Email" }

                Item { Layout.fillWidth: true }

                CButton {
                    text: "Reset"
                    variant: "ghost"
                    size: "sm"
                    onClicked: resetAll()
                }
                CButton {
                    text: "Save Configuration"
                    variant: "primary"
                    size: "sm"
                    onClicked: saveAll()
                }
            }

            // ══════════════════════════════════════════
            // Status Section
            // ══════════════════════════════════════════
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    CText { variant: "h4"; text: "Status" }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 16

                        CStatusBadge {
                            status: connectionStatus === "success" ? "success"
                                  : connectionStatus === "failed" ? "error"
                                  : connectionStatus === "testing" ? "warning"
                                  : "info"
                            text: connectionStatus === "success" ? "Connected"
                                : connectionStatus === "failed" ? "Failed"
                                : connectionStatus === "testing" ? "Testing..."
                                : "Not Tested"
                        }

                        CStatusBadge {
                            status: isDirty ? "warning" : "success"
                            text: isDirty ? "Unsaved Changes" : "Saved"
                        }
                    }

                    CText {
                        visible: lastTestResult.length > 0
                        variant: "body2"
                        text: lastTestResult
                    }

                    CText {
                        visible: lastTestTime.length > 0
                        variant: "caption"
                        text: "Last activity: " + lastTestTime
                    }
                }
            }

            // ══════════════════════════════════════════
            // SMTP Server + Sender (side by side)
            // ══════════════════════════════════════════
            RowLayout {
                Layout.fillWidth: true
                spacing: 16

                // ── SMTP Server Config ──
                CCard {
                    Layout.fillWidth: true
                    Layout.preferredWidth: 1

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 12

                        CText { variant: "h4"; text: "SMTP Server" }
                        CDivider { Layout.fillWidth: true }

                        CTextField {
                            Layout.fillWidth: true
                            label: "Host"
                            placeholderText: "smtp.example.com"
                            text: smtpHost
                            onTextChanged: { smtpHost = text; markDirty() }
                        }

                        CTextField {
                            Layout.fillWidth: true
                            label: "Port"
                            placeholderText: "587"
                            text: smtpPort
                            onTextChanged: { smtpPort = text; markDirty() }
                        }

                        CTextField {
                            Layout.fillWidth: true
                            label: "Username"
                            placeholderText: "user@example.com"
                            text: smtpUsername
                            onTextChanged: { smtpUsername = text; markDirty() }
                        }

                        CTextField {
                            Layout.fillWidth: true
                            label: "Password"
                            placeholderText: "Enter password"
                            echoMode: TextInput.Password
                            text: smtpPassword
                            onTextChanged: { smtpPassword = text; markDirty() }
                        }

                        // Encryption selector
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 4

                            CText { variant: "caption"; text: "Encryption" }

                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 8

                                Repeater {
                                    model: encryptionOptions
                                    delegate: CButton {
                                        text: modelData
                                        variant: encryptionIndex === index ? "primary" : "ghost"
                                        size: "sm"
                                        onClicked: { encryptionIndex = index; markDirty() }
                                    }
                                }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            CButton {
                                text: connectionStatus === "testing" ? "Testing..." : "Test Connection"
                                variant: "primary"
                                size: "sm"
                                enabled: connectionStatus !== "testing"
                                onClicked: testConnection()
                            }

                            CStatusBadge {
                                visible: connectionStatus === "success" || connectionStatus === "failed"
                                status: connectionStatus === "success" ? "success" : "error"
                                text: connectionStatus === "success" ? "OK" : "Fail"
                            }
                        }
                    }
                }

                // ── Sender Config ──
                CCard {
                    Layout.fillWidth: true
                    Layout.preferredWidth: 1
                    Layout.alignment: Qt.AlignTop

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 12

                        CText { variant: "h4"; text: "Sender" }
                        CDivider { Layout.fillWidth: true }

                        CTextField {
                            Layout.fillWidth: true
                            label: "From Name"
                            placeholderText: "MetaBuilder"
                            text: fromName
                            onTextChanged: { fromName = text; markDirty() }
                        }

                        CTextField {
                            Layout.fillWidth: true
                            label: "From Email"
                            placeholderText: "noreply@example.com"
                            text: fromEmail
                            onTextChanged: { fromEmail = text; markDirty() }
                        }

                        CDivider { Layout.fillWidth: true }

                        CText { variant: "caption"; text: "Preview" }

                        CPaper {
                            Layout.fillWidth: true

                            CText {
                                anchors.fill: parent
                                anchors.margins: 12
                                variant: "body2"
                                text: fromName + " <" + fromEmail + ">"
                            }
                        }
                    }
                }
            }

            // ══════════════════════════════════════════
            // Send Test Email
            // ══════════════════════════════════════════
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    CText { variant: "h4"; text: "Send Test Email" }
                    CDivider { Layout.fillWidth: true }

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 12

                        CTextField {
                            Layout.fillWidth: true
                            label: "Recipient"
                            placeholderText: "test@example.com"
                            text: testRecipient
                            onTextChanged: testRecipient = text
                        }

                        CTextField {
                            Layout.fillWidth: true
                            label: "Subject"
                            placeholderText: "Test subject"
                            text: testSubject
                            onTextChanged: testSubject = text
                        }
                    }

                    // Body textarea
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4

                        CText { variant: "caption"; text: "Body" }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 100
                            color: Theme.surface
                            border.color: Theme.border
                            border.width: 1
                            radius: 4

                            ScrollView {
                                anchors.fill: parent
                                anchors.margins: 8

                                TextArea {
                                    id: testBodyArea
                                    text: testBody
                                    wrapMode: Text.Wrap
                                    color: Theme.text
                                    font.pixelSize: 13
                                    background: null
                                    onTextChanged: testBody = text
                                }
                            }
                        }
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CButton {
                            text: sendingTest ? "Sending..." : "Send Test Email"
                            variant: "primary"
                            size: "sm"
                            enabled: !sendingTest && testRecipient.length > 0
                            onClicked: sendTestEmail()
                        }

                        CText {
                            visible: testRecipient.length === 0
                            variant: "caption"
                            text: "Enter a recipient to enable sending"
                        }
                    }
                }
            }

            // ══════════════════════════════════════════
            // Email Templates
            // ══════════════════════════════════════════
            RowLayout {
                Layout.fillWidth: true
                spacing: 16

                // ── Template List ──
                CCard {
                    Layout.preferredWidth: 280
                    Layout.fillHeight: true

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 8

                        CText { variant: "h4"; text: "Templates" }
                        CText { variant: "caption"; text: emailTemplates.length + " templates" }
                        CDivider { Layout.fillWidth: true }

                        ListView {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            Layout.minimumHeight: 200
                            model: emailTemplates
                            spacing: 2
                            clip: true

                            delegate: CListItem {
                                width: parent ? parent.width : 248
                                title: modelData.name
                                subtitle: modelData.id
                                selected: selectedTemplateIndex === index
                                onClicked: selectTemplate(index)
                            }
                        }
                    }
                }

                // ── Template Editor ──
                CCard {
                    Layout.fillWidth: true
                    Layout.fillHeight: true

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        spacing: 12

                        FlexRow {
                            Layout.fillWidth: true
                            spacing: 8

                            CText { variant: "h4"; text: "Template Editor" }

                            Item { Layout.fillWidth: true }

                            CButton {
                                visible: selectedTemplateIndex >= 0
                                text: "Save Template"
                                variant: "primary"
                                size: "sm"
                                onClicked: { saveTemplate(); markDirty() }
                            }
                        }

                        CDivider { Layout.fillWidth: true }

                        // No template selected state
                        CText {
                            visible: selectedTemplateIndex < 0
                            variant: "body2"
                            text: "Select a template from the list to edit."
                            Layout.alignment: Qt.AlignHCenter
                            Layout.topMargin: 40
                        }

                        // Template editing fields
                        ColumnLayout {
                            visible: selectedTemplateIndex >= 0
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            spacing: 12

                            CTextField {
                                Layout.fillWidth: true
                                label: "Template Name"
                                placeholderText: "e.g. Welcome Email"
                                text: editTemplateName
                                onTextChanged: editTemplateName = text
                            }

                            CTextField {
                                Layout.fillWidth: true
                                label: "Subject Template"
                                placeholderText: "e.g. Welcome to {{app_name}}"
                                text: editTemplateSubject
                                onTextChanged: editTemplateSubject = text
                            }

                            // Body template textarea
                            ColumnLayout {
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                spacing: 4

                                FlexRow {
                                    Layout.fillWidth: true
                                    spacing: 8

                                    CText { variant: "caption"; text: "Body Template" }

                                    Item { Layout.fillWidth: true }

                                    CText {
                                        variant: "caption"
                                        text: "Supports {{variable}} placeholders"
                                    }
                                }

                                Rectangle {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    Layout.minimumHeight: 180
                                    color: Theme.surface
                                    border.color: Theme.border
                                    border.width: 1
                                    radius: 4

                                    ScrollView {
                                        anchors.fill: parent
                                        anchors.margins: 8

                                        TextArea {
                                            text: editTemplateBody
                                            wrapMode: Text.Wrap
                                            color: Theme.text
                                            font.pixelSize: 13
                                            font.family: "monospace"
                                            background: null
                                            onTextChanged: editTemplateBody = text
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 8 }
        }
    }
}

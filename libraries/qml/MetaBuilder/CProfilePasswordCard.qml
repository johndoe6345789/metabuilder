import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    Layout.fillWidth: true
    Layout.leftMargin: 24
    Layout.rightMargin: 24
    variant: "filled"

    property var passwordFields: []
    property var passwords: ({ "current": "", "new": "", "confirm": "" })

    signal passwordChanged(string key, string value)

    CText { Layout.fillWidth: true; variant: "h4"; text: "Change Password" }
    Item { Layout.preferredHeight: 8 }
    CDivider { Layout.fillWidth: true }
    Item { Layout.preferredHeight: 14 }

    Repeater {
        model: root.passwordFields
        delegate: ColumnLayout {
            Layout.fillWidth: true; spacing: 0
            CTextField {
                Layout.fillWidth: true
                label: modelData.label
                placeholderText: modelData.placeholder
                echoMode: TextInput.Password
                text: root.passwords[modelData.key]
                onTextChanged: root.passwordChanged(modelData.key, text)
            }
            Item { Layout.preferredHeight: 14 }
        }
    }

    CAlert {
        Layout.fillWidth: true; severity: "info"
        text: "Passwords must be at least 8 characters with uppercase,
            lowercase, and a number."
        visible: root.passwords["new"].length > 0
    }
    CAlert {
        Layout.fillWidth: true; severity: "error"
        text: "Passwords do not match."
        visible: root.passwords["confirm"].length > 0 &&
            root.passwords["new"] !== root.passwords["confirm"]
    }
}

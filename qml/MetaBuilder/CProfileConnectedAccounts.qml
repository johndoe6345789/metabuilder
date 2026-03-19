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

    property var accounts: []
    property string currentUser: ""

    CText {
        Layout.fillWidth: true
        variant: "h4"
        text: "Connected Accounts"
    }
    Item { Layout.preferredHeight: 8 }
    CDivider { Layout.fillWidth: true }
    Item { Layout.preferredHeight: 8 }

    Repeater {
        model: root.accounts
        delegate: ColumnLayout {
            Layout.fillWidth: true; spacing: 0
            CListItem {
                Layout.fillWidth: true; title: modelData.service
                subtitle: modelData.linked
                    ? "Linked as @"
                        + root.currentUser
                    : "Not linked"
                leadingIcon: modelData.icon
            }
            FlexRow {
                Layout.fillWidth: true; Layout.leftMargin: 12; spacing: 8
                CStatusBadge {
                    status: modelData.statusType
                    text: modelData.statusText
                }
                Item { Layout.fillWidth: true }
                CButton {
                    text: modelData.linked
                        ? (modelData.unlinkLabel
                            || "Unlink")
                        : (modelData.linkLabel
                            || "Link Account")
                    variant: modelData.linked
                        ? "ghost" : "primary"
                    size: "sm"
                }
            }
            Item {
                Layout.preferredHeight: 8
                visible: index
                    < (root.accounts.length - 1)
            }
            CDivider {
                Layout.fillWidth: true
                visible: index
                    < (root.accounts.length - 1)
            }
            Item {
                Layout.preferredHeight: 8
                visible: index
                    < (root.accounts.length - 1)
            }
        }
    }
}

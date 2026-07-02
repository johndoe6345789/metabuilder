import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    required property var transfer
    property bool isDark: false

    signal approve()
    signal deny()

    visible: root.transfer != null

    readonly property var _tr: root.transfer || {
        from: "", to: "", expiry: "", reason: "", status: ""
    }
    Layout.fillWidth: true

    FlexRow {
        Layout.fillWidth: true
        spacing: 10

        CText { variant: "subtitle1"
        text: root._tr.from + " -> " + root._tr.to }
        CStatusBadge { status: "warning"; text: "Pending" }
        Item { Layout.fillWidth: true }
        CText { variant: "caption"; text: "Expires: " + root._tr.expiry
        color: Theme.textSecondary }
    }

    CText {
        variant: "body2"
        text: root._tr.reason
        wrapMode: Text.Wrap
        Layout.fillWidth: true
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8

        Item { Layout.fillWidth: true }
        CButton {
            text: "Approve"
            variant: "primary"
            size: "sm"
            onClicked: root.approve()
        }
        CButton {
            text: "Deny"
            variant: "danger"
            size: "sm"
            onClicked: root.deny()
        }
    }
}

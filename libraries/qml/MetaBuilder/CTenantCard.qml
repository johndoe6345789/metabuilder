import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    required property var tenant
    property bool isDark: false
    visible: root.tenant != null

    readonly property var _t: root.tenant || {
        name: "", status: "", owner: "", homepage: "", created: ""
    }

    signal edit()
    signal remove()

    Layout.fillWidth: true

    FlexRow {
        Layout.fillWidth: true
        spacing: 10

        CText { variant: "h4"; text: root._t.name }
        CStatusBadge {
            status: root._t.status === "active" ? "success" : "warning"
            text: root._t.status
        }
        Item { Layout.fillWidth: true }
        CBadge { text: "Tenant"; badgeColor: Theme.primary }
    }

    CDivider { Layout.fillWidth: true }

    RowLayout {
        Layout.fillWidth: true
        spacing: 24

        ColumnLayout {
            spacing: 4
            CText { variant: "caption"; text: "Owner"
            color: Theme.textSecondary }
            CText { variant: "body1"; text: root._t.owner }
        }
        ColumnLayout {
            spacing: 4
            CText { variant: "caption"; text: "Homepage"
            color: Theme.textSecondary }
            CText { variant: "body1"; text: root._t.homepage }
        }
        ColumnLayout {
            spacing: 4
            CText { variant: "caption"; text: "Created"
            color: Theme.textSecondary }
            CText { variant: "body1"; text: root._t.created }
        }
        Item { Layout.fillWidth: true }
        CButton {
            text: "Configure"
            variant: "ghost"
            size: "sm"
            onClicked: root.edit()
        }
    }
}

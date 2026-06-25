import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    // ── Data properties ──
    property int tenantCount: 0
    property int godUserCount: 0
    property int pendingTransferCount: 0

    // ── Navigation signals ──
    signal navigateToLevel(int level)

    FlexRow {
        Layout.fillWidth: true
        spacing: 12

        CText { variant: "h2"; text: "Super God Panel" }
        CBadge { text: "Level 5"; badgeColor: Theme.primary }
        CStatusBadge { status: "success"; text: "Platform Control" }

        Item { Layout.fillWidth: true }

        CButton {
            text: "Level 4"; variant: "ghost"; size: "sm"
            onClicked: root.navigateToLevel(4)
        }
        CButton {
            text: "Level 3"; variant: "ghost"; size: "sm"
            onClicked: root.navigateToLevel(3)
        }
        CButton {
            text: "Level 2"; variant: "ghost"; size: "sm"
            onClicked: root.navigateToLevel(2)
        }
    }

    CDivider { Layout.fillWidth: true }

    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        CChip { text: root.tenantCount + " Tenants"; chipColor: Theme.primary }
        CChip { text: root.godUserCount + " God Users"
        chipColor: Theme.primary }
        CChip { text: root.pendingTransferCount + " Pending Transfers"
        chipColor: Theme.warning }
        CChip { text: "14 DB Backends"; chipColor: Theme.info }
        CChip { text: "4 Daemons"; chipColor: Theme.success }
    }
}

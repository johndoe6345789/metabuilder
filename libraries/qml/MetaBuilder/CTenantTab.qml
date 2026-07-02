import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: "transparent"

    // ── Data ──
    property var tenants: []

    // ── Signals ──
    signal createTenantRequested()
    signal editTenant(var tenant)

    ScrollView {
        anchors.fill: parent
        clip: true
        ColumnLayout {
            width: parent.width
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText { variant: "h3"; text: "Tenant Management" }
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Create Tenant"; variant: "primary"; size: "sm"
                    onClicked: root.createTenantRequested()
                }
            }

            CText {
                variant: "body2"
                text: "Cross-tenant provisioning and configuration. Each tenant
                    operates in full isolation with its own schemas, users, and
                        data."
                wrapMode: Text.Wrap; Layout.fillWidth: true
                color: Theme.textSecondary
            }

            CDivider { Layout.fillWidth: true }

            Repeater {
                model: root.tenants
                delegate: CTenantCard {
                    required property var modelData
                    tenant: modelData
                    onEdit: root.editTenant(modelData)
                }
            }
        }
    }
}

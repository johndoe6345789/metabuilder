import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "tab_god_users"
    Accessible.role: Accessible.PageTab
    Accessible.name: "God Users"
    color: "transparent"

    // ── Data ──
    property var godUsers: []

    // ── Signals ──
    signal manageUser(var user)

    ScrollView {
        anchors.fill: parent
        clip: true
        ColumnLayout {
            width: parent.width
            spacing: 16

            CText { variant: "h3"; text: "God Users (Level 4+)" }
            CText {
                variant: "body2"
                text: "All users with god-level (L4) or super-god-level (L5)
                    platform access across all tenants."
                wrapMode: Text.Wrap; Layout.fillWidth: true
                color: Theme.textSecondary
            }

            CDivider { Layout.fillWidth: true }

            Repeater {
                model: root.godUsers
                delegate: CGodUserCard {
                    required property var modelData
                    user: modelData
                    onDemote: root.manageUser(modelData)
                }
            }
        }
    }
}

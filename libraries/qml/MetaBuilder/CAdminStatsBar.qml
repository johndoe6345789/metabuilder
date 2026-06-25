import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CAdminStatsBar.qml - Stats bar showing entity counts with colored accents
 *
 * Usage:
 *   CAdminStatsBar {
 *       stats: [
 *           { label: "Total Users", value: 8, accent: "#4CAF50" },
 *           { label: "Active Sessions", value: 6, accent: "#2196F3" }
 *       ]
 *   }
 */
Rectangle {
    id: root
    objectName: "bar_admin_stats"
    Accessible.role: Accessible.Pane
    Accessible.name: "Admin Statistics"

    property var stats: []   // Array of { label, value, accent }
    property bool isDark: Theme.mode === "dark"

    Layout.fillWidth: true
    Layout.preferredHeight: 88
    color: Theme.surface
    radius: 0

    RowLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 12

        Repeater {
            model: root.stats

            delegate: CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true
                Accessible.role: Accessible.StaticText
                Accessible.name: modelData.label
                    + ": " + String(modelData.value)

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 8

                    Rectangle {
                        width: 4
                        Layout.fillHeight: true
                        color: modelData.accent
                        radius: 2
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 2
                        CText { variant: "caption"; text: modelData.label
                        color: Theme.textSecondary }
                        CText { variant: "h3"; text: String(modelData.value) }
                    }
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CSettingsSection - Generic settings section with title and content slot.
 *
 * Usage:
 *   CSettingsSection {
 *       title: "Appearance"
 *       isDark: Theme.mode === "dark"
 *       CText { text: "Hello" }
 *   }
 */
CCard {
    id: root
    Layout.fillWidth: true

    property string title: ""
    property bool isDark: Theme.mode === "dark"

    default property alias content: contentColumn.data

    CText {
        variant: "h4"
        text: root.title
    }

    CDivider { Layout.fillWidth: true }

    ColumnLayout {
        id: contentColumn
        Layout.fillWidth: true
        spacing: 0
    }
}

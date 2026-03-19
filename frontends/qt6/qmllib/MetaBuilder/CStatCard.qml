import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property string label: ""
    property string value: ""
    property string status: "info"
    property bool isDark: false

    readonly property color onSurfaceVariant: Theme.textSecondary

    variant: "outlined"

    CText {
        Layout.fillWidth: true
        variant: "caption"
        text: root.label
        color: root.onSurfaceVariant
    }

    Item { Layout.preferredHeight: 4 }

    CText {
        Layout.fillWidth: true
        variant: "h3"
        text: root.value
    }

    Item { Layout.preferredHeight: 8 }

    CStatusBadge {
        status: root.status
        text: root.status === "success" ? "Online" : "Active"
    }
}

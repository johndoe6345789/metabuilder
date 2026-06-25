import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root
    objectName: "list_activity"
    Accessible.role: Accessible.List
    Accessible.name: "Recent Activity"

    property var activities: []
    property bool isDark: false

    variant: "filled"

    CText {
        Layout.fillWidth: true
        variant: "h4"
        text: "Recent Activity"
    }

    Item { Layout.preferredHeight: 8 }

    CDivider { Layout.fillWidth: true }

    Item { Layout.preferredHeight: 8 }

    Repeater {
        model: root.activities
        delegate: CListItem {
            Layout.fillWidth: true
            title: modelData.action
            subtitle: modelData.detail + " \u00b7 " + modelData.time
        }
    }
}

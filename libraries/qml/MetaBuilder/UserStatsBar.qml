import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

FlexRow {
    id: root
    spacing: 12

    property int totalUsers: 0
    property int adminCount: 0
    property int godCount: 0
    property int superGodCount: 0

    CCard {
        Layout.fillWidth: true
        implicitHeight: col1.implicitHeight + 32

        ColumnLayout {
            id: col1
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Total Users" }
            CText { variant: "h4"; text: String(root.totalUsers) }
        }
    }

    CCard {
        Layout.fillWidth: true
        implicitHeight: col2.implicitHeight + 32

        ColumnLayout {
            id: col2
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Admins" }
            CText { variant: "h4"; text: String(root.adminCount) }
        }
    }

    CCard {
        Layout.fillWidth: true
        implicitHeight: col3.implicitHeight + 32

        ColumnLayout {
            id: col3
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "Gods" }
            CText { variant: "h4"; text: String(root.godCount) }
        }
    }

    CCard {
        Layout.fillWidth: true
        implicitHeight: col4.implicitHeight + 32

        ColumnLayout {
            id: col4
            Layout.fillWidth: true
            spacing: 4
            CText { variant: "caption"; text: "SuperGods" }
            CText { variant: "h4"; text: String(root.superGodCount) }
        }
    }
}

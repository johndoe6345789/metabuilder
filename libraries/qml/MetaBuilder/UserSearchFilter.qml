import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property string searchText: ""
    property string activeRoleFilter: "all"

    signal searchChanged(string text)
    signal roleFilterChanged(string role)

    implicitHeight: filterCol.implicitHeight + 32

    ColumnLayout {
        id: filterCol
        Layout.fillWidth: true
        spacing: 12

        CTextField {
            Layout.fillWidth: true
            label: "Search"
            placeholderText: "Filter by username, email, or role..."
            text: root.searchText
            onTextChanged: root.searchChanged(text)
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 8

            CChip {
                text: "All"
                selected: root.activeRoleFilter === "all"
                onClicked: root.roleFilterChanged("all")
            }
            CChip {
                text: "User"
                selected: root.activeRoleFilter === "user"
                onClicked: root.roleFilterChanged("user")
            }
            CChip {
                text: "Admin"
                selected: root.activeRoleFilter === "admin"
                onClicked: root.roleFilterChanged("admin")
            }
            CChip {
                text: "God"
                selected: root.activeRoleFilter === "god"
                onClicked: root.roleFilterChanged("god")
            }
            CChip {
                text: "SuperGod"
                selected: root.activeRoleFilter === "supergod"
                onClicked: root.roleFilterChanged("supergod")
            }
        }
    }
}

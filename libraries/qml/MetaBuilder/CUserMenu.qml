import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

// User avatar circle with dropdown menu (Profile, Settings, Sign out)
Item {
    id: root

    property string username: ""
    property int level: 1
    property string role: "public"
    property bool isDark: Theme.mode === "dark"

    signal navigateTo(string view)
    signal signOut()

    width: 32
    height: 32

    // ── Avatar circle ──
    Rectangle {
        id: avatarCircle
        anchors.fill: parent
        radius: 16
        activeFocusOnTab: true
        Accessible.role: Accessible.Button
        Accessible.name: "User menu: " + root.username
        Accessible.description:
            "Open user menu for " + root.username
        Keys.onReturnPressed:
            dropdownMenu.visible = !dropdownMenu.visible
        Keys.onSpacePressed:
            dropdownMenu.visible = !dropdownMenu.visible
        color: avatarMA.containsMouse
            ? Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.25 : 0.2)
            : Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.15 : 0.12)

        Behavior on color { ColorAnimation { duration: 150 } }

        CText {
            anchors.centerIn: parent
            text: username ? username.charAt(0).toUpperCase() : "?"
            font.pixelSize: 14
            font.weight: Font.Bold
            color: "#6366F1"
        }

        MouseArea {
            id: avatarMA
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: dropdownMenu.visible = !dropdownMenu.visible
        }

        // ── Dropdown menu ──
        CDropdownMenu {
            id: dropdownMenu
            Accessible.role: Accessible.PopupMenu
            Accessible.name: "User actions"
            visible: false
            anchors.top: parent.bottom
            anchors.right: parent.right
            anchors.topMargin: 8
            isDark: root.isDark

            menuItems: [
                { label: "Profile",  icon: "P", action: "profile" },
                { label: "Settings", icon: "S", action: "settings" }
            ]

            onItemClicked: function(action) {
                root.navigateTo(action);
                dropdownMenu.close();
            }

            headerContent: Component {
                RowLayout {
                    Layout.fillWidth: true
                    Layout.margins: 8
                    spacing: 10

                    Rectangle {
                        width: 36
                        height: 36
                        radius: 18
                        color: Qt.rgba(0.39, 0.4, 0.95,
                            root.isDark ? 0.2 : 0.15)

                        CText {
                            anchors.centerIn: parent
                            text: root.username
                                ? root.username.charAt(0).toUpperCase()
                                : "?"
                            font.pixelSize: 16
                            font.weight: Font.Bold
                            color: "#6366F1"
                        }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 1
                        CText {
                            text: root.username
                            font.pixelSize: 14
                            font.weight: Font.DemiBold
                        }
                        CText {
                            text: "L" + root.level + " \u00B7 " + root.role
                            font.pixelSize: 11
                            font.family: "monospace"
                            color: Theme.textSecondary
                        }
                    }
                }
            }

            footerContent: Component {
                Rectangle {
                    Layout.fillWidth: true
                    height: 36
                    radius: 8
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Sign out"
                    Keys.onReturnPressed: {
                        dropdownMenu.close()
                        root.signOut()
                    }
                    Keys.onSpacePressed: {
                        dropdownMenu.close()
                        root.signOut()
                    }
                    color: logoutMA.containsMouse
                        ? Qt.rgba(0.96, 0.25, 0.37, 0.08)
                        : "transparent"

                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 12
                        spacing: 10
                        CText {
                            text: "\u2192"
                            font.pixelSize: 14
                            color: "#F43F5E"
                        }
                        CText {
                            text: "Sign out"
                            font.pixelSize: 13
                            color: "#F43F5E"
                        }
                    }

                    MouseArea {
                        id: logoutMA
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            dropdownMenu.close()
                            root.signOut()
                        }
                    }
                }
            }
        }
    }
}

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

    // ── MD3 palette ──
    readonly property color surfaceContainer: isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)

    // ── Avatar circle ──
    Rectangle {
        id: avatarCircle
        anchors.fill: parent
        radius: 16
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
        Rectangle {
            id: dropdownMenu
            visible: false
            anchors.top: parent.bottom
            anchors.right: parent.right
            anchors.topMargin: 8
            width: 200
            height: menuCol.implicitHeight + 16
            radius: 12
            color: Theme.paper
            border.color: isDark ? Qt.rgba(1,1,1,0.1) : Qt.rgba(0,0,0,0.1)
            border.width: 1
            z: 100

            ColumnLayout {
                id: menuCol
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 8
                spacing: 2

                // User info header
                RowLayout {
                    Layout.fillWidth: true
                    Layout.margins: 8
                    spacing: 10

                    Rectangle {
                        width: 36
                        height: 36
                        radius: 18
                        color: Qt.rgba(0.39, 0.4, 0.95, isDark ? 0.2 : 0.15)

                        CText {
                            anchors.centerIn: parent
                            text: username ? username.charAt(0).toUpperCase() : "?"
                            font.pixelSize: 16
                            font.weight: Font.Bold
                            color: "#6366F1"
                        }
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 1
                        CText {
                            text: username
                            font.pixelSize: 14
                            font.weight: Font.DemiBold
                        }
                        CText {
                            text: "L" + level + " \u00B7 " + role
                            font.pixelSize: 11
                            font.family: "monospace"
                            color: Theme.textSecondary
                        }
                    }
                }

                // Divider
                Rectangle {
                    Layout.fillWidth: true
                    Layout.leftMargin: 8
                    Layout.rightMargin: 8
                    height: 1
                    color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.06)
                }

                // Menu items
                Repeater {
                    model: [
                        { label: "Profile",  icon: "P", view: "profile" },
                        { label: "Settings", icon: "S", view: "settings" }
                    ]
                    delegate: Rectangle {
                        Layout.fillWidth: true
                        height: 36
                        radius: 8
                        color: menuItemMA.containsMouse ? (isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.04)) : "transparent"

                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12
                            spacing: 10
                            CText {
                                text: modelData.icon
                                font.pixelSize: 14
                                color: Theme.textSecondary
                            }
                            CText {
                                text: modelData.label
                                font.pixelSize: 13
                            }
                        }

                        MouseArea {
                            id: menuItemMA
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                root.navigateTo(modelData.view)
                                dropdownMenu.visible = false
                            }
                        }
                    }
                }

                // Divider
                Rectangle {
                    Layout.fillWidth: true
                    Layout.leftMargin: 8
                    Layout.rightMargin: 8
                    height: 1
                    color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.06)
                }

                // Sign out
                Rectangle {
                    Layout.fillWidth: true
                    height: 36
                    radius: 8
                    color: logoutMA.containsMouse ? Qt.rgba(0.96, 0.25, 0.37, 0.08) : "transparent"

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
                            dropdownMenu.visible = false
                            root.signOut()
                        }
                    }
                }
            }
        }
    }
}

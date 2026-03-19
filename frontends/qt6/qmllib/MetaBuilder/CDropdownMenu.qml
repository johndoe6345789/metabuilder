import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CDropdownMenu.qml - Reusable dropdown menu panel with header, items, and footer
 *
 * Usage:
 *   CDropdownMenu {
 *       visible: false
 *       width: 200
 *       isDark: Theme.mode === "dark"
 *       menuItems: [
 *           { label: "Profile", icon: "P", action: "profile" },
 *           { label: "Settings", icon: "S", action: "settings" }
 *       ]
 *       onItemClicked: function(action) { ... }
 *
 *       headerContent: RowLayout { ... }   // optional
 *       footerContent: Rectangle { ... }   // optional
 *   }
 */
Rectangle {
    id: root

    property bool isDark: Theme.mode === "dark"
    property var menuItems: []

    property alias headerContent: headerLoader.sourceComponent
    property alias footerContent: footerLoader.sourceComponent

    signal itemClicked(string action)

    radius: 12
    color: Theme.paper
    border.color: isDark ? Qt.rgba(1,1,1,0.1) : Qt.rgba(0,0,0,0.1)
    border.width: 1
    z: 100

    height: menuCol.implicitHeight + 16
    width: 200

    function close() {
        root.visible = false;
    }

    ColumnLayout {
        id: menuCol
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 8
        spacing: 2

        // Optional header
        Loader {
            id: headerLoader
            Layout.fillWidth: true
            active: sourceComponent !== null
        }

        // Divider after header
        Rectangle {
            Layout.fillWidth: true
            Layout.leftMargin: 8
            Layout.rightMargin: 8
            height: 1
            color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.06)
            visible: headerLoader.active
        }

        // Menu items
        Repeater {
            model: root.menuItems
            delegate: Rectangle {
                Layout.fillWidth: true
                height: 36
                radius: 8
                color: itemMA.containsMouse ? (isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.04)) : "transparent"

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    spacing: 10
                    CText {
                        text: modelData.icon
                        font.pixelSize: 14
                        color: modelData.color || Theme.textSecondary
                    }
                    CText {
                        text: modelData.label
                        font.pixelSize: 13
                        color: modelData.color || Theme.text
                    }
                }

                MouseArea {
                    id: itemMA
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        root.itemClicked(modelData.action)
                    }
                }
            }
        }

        // Divider before footer
        Rectangle {
            Layout.fillWidth: true
            Layout.leftMargin: 8
            Layout.rightMargin: 8
            height: 1
            color: isDark ? Qt.rgba(1,1,1,0.06) : Qt.rgba(0,0,0,0.06)
            visible: footerLoader.active
        }

        // Optional footer
        Loader {
            id: footerLoader
            Layout.fillWidth: true
            active: sourceComponent !== null
        }
    }
}

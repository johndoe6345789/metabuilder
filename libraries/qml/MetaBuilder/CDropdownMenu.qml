import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "menu_dropdown"
    Accessible.role: Accessible.PopupMenu
    Accessible.name: "Dropdown Menu"
    activeFocusOnTab: true

    property bool isDark: Theme.mode === "dark"
    property var menuItems: []
    property int _focusedItem: 0

    property alias headerContent: headerLoader.sourceComponent
    property alias footerContent: footerLoader.sourceComponent

    signal itemClicked(string action)

    radius: 12
    color: Theme.paper
    border.color: isDark
        ? Qt.rgba(1,1,1,0.1) : Qt.rgba(0,0,0,0.1)
    border.width: 1
    z: 100

    height: menuCol.implicitHeight + 16
    width: 200

    function close() {
        root.visible = false;
    }

    Keys.onEscapePressed: root.close()
    Keys.onUpPressed: {
        if (_focusedItem > 0) _focusedItem -= 1
    }
    Keys.onDownPressed: {
        if (_focusedItem < menuItems.length - 1)
            _focusedItem += 1
    }
    Keys.onReturnPressed: {
        if (_focusedItem >= 0
                && _focusedItem < menuItems.length)
            root.itemClicked(
                menuItems[_focusedItem].action)
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
            delegate: CDropdownMenuItem {
                isDark: root.isDark
                icon: modelData.icon
                label: modelData.label
                itemColor: modelData.color || "transparent"
                action: modelData.action
                activeFocusOnTab: true
                Accessible.role: Accessible.MenuItem
                Accessible.name: modelData.label
                Accessible.description:
                    "Menu item " + (index + 1)
                    + " of " + root.menuItems.length
                onTriggered: function(act) {
                    root.itemClicked(act)
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

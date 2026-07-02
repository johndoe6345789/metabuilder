import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

// Left sidebar with navigation header, static items, dynamic package items,
// Settings
Rectangle {
    id: root
    Accessible.role: Accessible.Pane
    Accessible.name: "Navigation"

    property string currentView: "frontpage"
    property int currentLevel: 1
    property bool loggedIn: false

    // PackageLoader helper — caller must provide this function
    // to convert a package object to a view name
    property var packageViewName: function(pkg) {
        return pkg.navLabel
            ? pkg.navLabel.toLowerCase()
                .replace(/ /g, "-")
            : pkg.packageId
    }

    signal navigate(string view)

    visible: loggedIn
    color: Theme.paper
    border.color: Theme.border
    border.width: 1

    implicitWidth: 220

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 4

        CText {
            variant: "subtitle2"
            text: "Navigation"
            Layout.bottomMargin: 8
        }

        // Static core nav items
        Repeater {
            model: {
                var items = [
                    { label: "Dashboard",
                      view: "dashboard",
                      icon: "~", level: 2 },
                    { label: "Profile",
                      view: "profile",
                      icon: "P", level: 2 },
                    { label: "Comments",
                      view: "comments",
                      icon: "C", level: 2 },
                    { label: "Mod Tools",
                      view: "moderator",
                      icon: "M", level: 3 },
                    { label: "Admin Panel",
                      view: "admin",
                      icon: "A", level: 4 },
                    { label: "God Panel",
                      view: "god-panel",
                      icon: "G", level: 5 },
                    { label: "Super God",
                      view: "supergod",
                      icon: "S", level: 6 }
                ]
                return items.filter(function(item) {
                    return item.level <= root.currentLevel
                })
            }

            delegate: CListItem {
                Layout.fillWidth: true
                activeFocusOnTab: true
                title: modelData.label
                leadingIcon: modelData.icon
                selected: root.currentView
                    === modelData.view
                Accessible.role: Accessible.MenuItem
                Accessible.name: modelData.label
                Accessible.description:
                    selected
                    ? modelData.label + ", current page"
                    : modelData.label
                Keys.onReturnPressed:
                    root.navigate(modelData.view)
                Keys.onSpacePressed:
                    root.navigate(modelData.view)
                onClicked: {
                    root.navigate(modelData.view)
                }
            }
        }

        // Dynamic package nav items (from PackageLoader)
        Repeater {
            model: {
                var navPkgs = PackageLoader
                    ? PackageLoader.navigablePackages() : []
                return navPkgs.filter(function(pkg) {
                    var lvl = pkg.level ? pkg.level : 2
                    return lvl <= root.currentLevel
                })
            }

            delegate: CListItem {
                Layout.fillWidth: true
                activeFocusOnTab: true
                title: modelData.navLabel
                    ? modelData.navLabel
                    : modelData.name
                leadingIcon: modelData.icon
                    ? modelData.icon
                    : modelData.name.charAt(0)
                selected: root.currentView
                    === root.packageViewName(modelData)
                Accessible.role: Accessible.MenuItem
                Accessible.name: modelData.navLabel
                    || modelData.name
                Accessible.description:
                    selected
                    ? (modelData.navLabel
                        || modelData.name)
                        + ", current page"
                    : (modelData.navLabel
                        || modelData.name)
                Keys.onReturnPressed: root.navigate(
                    root.packageViewName(modelData))
                Keys.onSpacePressed: root.navigate(
                    root.packageViewName(modelData))
                onClicked: root.navigate(
                    root.packageViewName(modelData))
            }
        }

        Item { Layout.fillHeight: true }

        CDivider { Layout.fillWidth: true }

        CListItem {
            Layout.fillWidth: true
            activeFocusOnTab: true
            title: "Settings"
            leadingIcon: "S"
            selected: root.currentView === "settings"
            Accessible.role: Accessible.MenuItem
            Accessible.name: "Settings"
            Keys.onReturnPressed: root.navigate("settings")
            Keys.onSpacePressed: root.navigate("settings")
            onClicked: root.navigate("settings")
        }
    }
}

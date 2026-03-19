import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    // ── DBAL ──────────────────────────────────────────────────────────
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected

    property int selectedIndex: -1
    property bool addDialogVisible: false
    property bool deleteDialogVisible: false

    property var layoutOptions: ["default", "sidebar", "dashboard", "blank"]
    property var levelOptions: [1, 2, 3, 4, 5]

    property var routes: [
        { path: "/",           title: "Home",          level: 1, layout: "default",   enabled: true,  permissions: "public" },
        { path: "/dashboard",  title: "Dashboard",     level: 1, layout: "dashboard", enabled: true,  permissions: "authenticated" },
        { path: "/admin",      title: "Admin Panel",   level: 3, layout: "sidebar",   enabled: true,  permissions: "role:admin" },
        { path: "/forum",      title: "Forum",         level: 1, layout: "sidebar",   enabled: true,  permissions: "authenticated" },
        { path: "/gallery",    title: "Gallery",       level: 1, layout: "default",   enabled: true,  permissions: "public" },
        { path: "/profile",    title: "Profile",       level: 1, layout: "sidebar",   enabled: true,  permissions: "authenticated" },
        { path: "/settings",   title: "Settings",      level: 2, layout: "sidebar",   enabled: true,  permissions: "authenticated" },
        { path: "/god-panel",  title: "God Panel",     level: 4, layout: "dashboard", enabled: true,  permissions: "role:god" },
        { path: "/supergod",   title: "Super God",     level: 5, layout: "blank",     enabled: false, permissions: "role:supergod" }
    ]

    function updateRoute(index, field, value) {
        var updated = routes.slice()
        var route = Object.assign({}, updated[index])
        route[field] = value
        updated[index] = route
        routes = updated
        if (selectedIndex === index) { selectedIndex = -1; selectedIndex = index }
        if (useLiveData) saveRoute(index)
    }

    function addRoute(path, title, level, layout) {
        var newRoute = { path: path, title: title, level: level, layout: layout, enabled: true, permissions: "authenticated" }
        if (useLiveData) {
            dbal.create("ui_page", newRoute, function(result, error) { if (!error) loadRoutes() })
        } else {
            var updated = routes.slice(); updated.push(newRoute); routes = updated
        }
    }

    function deleteRoute() {
        if (selectedIndex < 0 || selectedIndex >= routes.length) return
        if (useLiveData && routes[selectedIndex].id) {
            dbal.remove("ui_page", routes[selectedIndex].id, function(result, error) { if (!error) loadRoutes() })
        } else {
            var updated = routes.slice(); updated.splice(selectedIndex, 1); routes = updated
        }
        selectedIndex = -1; deleteDialogVisible = false
    }

    function moveRoute(fromIndex, direction) {
        var toIndex = fromIndex + direction
        if (toIndex < 0 || toIndex >= routes.length) return
        var updated = routes.slice()
        var temp = updated[fromIndex]; updated[fromIndex] = updated[toIndex]; updated[toIndex] = temp
        routes = updated; selectedIndex = toIndex
    }

    // ── DBAL Integration ─────────────────────────────────────────────
    function loadRoutes() {
        dbal.list("ui_page", { take: 100 }, function(result, error) {
            if (!error && result && result.items && result.items.length > 0) {
                var parsed = []
                for (var i = 0; i < result.items.length; i++) {
                    var r = result.items[i]
                    parsed.push({ id: r.id || undefined, path: r.path || r.route || "", title: r.title || r.name || "",
                                  level: r.level || 1, layout: r.layout || "default", enabled: r.enabled !== undefined ? r.enabled : true, permissions: r.permissions || "public" })
                }
                routes = parsed
            }
        })
    }

    function saveRoute(index) {
        if (!useLiveData) return
        var route = routes[index]
        var data = { path: route.path, title: route.title, level: route.level, layout: route.layout, enabled: route.enabled, permissions: route.permissions }
        if (route.id) dbal.update("ui_page", route.id, data, function(r, e) { if (!e) loadRoutes() })
        else dbal.create("ui_page", data, function(r, e) { if (!e) loadRoutes() })
    }

    onUseLiveDataChanged: { if (useLiveData) loadRoutes() }
    Component.onCompleted: { loadRoutes() }

    // ── UI ───────────────────────────────────────────────────────────
    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 16

        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText { variant: "h3"; text: "Page Routes Manager" }
            Item { Layout.fillWidth: true }
            CBadge { text: routes.length + " routes" }
            CButton { text: "Add Route"; variant: "primary"; size: "sm"; onClicked: addDialogVisible = true }
        }

        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 16

            CCard {
                Layout.fillWidth: true; Layout.fillHeight: true; Layout.preferredWidth: 580

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 0

                    CRouteTableHeader { }
                    CDivider { Layout.fillWidth: true }

                    ListView {
                        id: routeList
                        Layout.fillWidth: true; Layout.fillHeight: true
                        model: routes; clip: true; spacing: 1

                        delegate: CRouteTableRow {
                            routeData: modelData
                            isSelected: index === selectedIndex
                            routeIndex: index
                            routeCount: routes.length
                            onClicked: selectedIndex = (selectedIndex === index ? -1 : index)
                            onMoveUp: moveRoute(index, -1)
                            onMoveDown: moveRoute(index, 1)
                        }
                    }
                }
            }

            CRouteEditPanel {
                Layout.preferredWidth: 340; Layout.fillHeight: true
                visible: selectedIndex >= 0 && selectedIndex < routes.length
                route: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex] : null
                layoutOptions: root.layoutOptions; levelOptions: root.levelOptions
                onFieldChanged: function(field, value) { updateRoute(selectedIndex, field, value) }
                onDeleteRequested: deleteDialogVisible = true
            }

            CCard {
                Layout.preferredWidth: 340; Layout.fillHeight: true
                visible: selectedIndex < 0 || selectedIndex >= routes.length

                ColumnLayout {
                    anchors.fill: parent; anchors.margins: 16; spacing: 12
                    Item { Layout.fillHeight: true }
                    CText { variant: "body2"; text: "Select a route from the table to edit its configuration."; Layout.fillWidth: true; horizontalAlignment: Text.AlignHCenter; wrapMode: Text.WordWrap }
                    Item { Layout.fillHeight: true }
                }
            }
        }
    }

    CAddRouteDialog {
        id: addDialog
        visible: addDialogVisible
        layoutOptions: root.layoutOptions; levelOptions: root.levelOptions
        onAddRoute: function(path, title, level, layout) { root.addRoute(path, title, level, layout) }
    }

    CDeleteConfirmDialog {
        id: deleteDialog
        visible: deleteDialogVisible
        title: "Delete Route"
        itemName: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].path : ""
        description: "This action cannot be undone. The route will be permanently removed from the configuration."
        onConfirmed: deleteRoute()
    }
}

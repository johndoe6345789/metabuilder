import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "PageRoutesDBAL.js" as DBAL

Rectangle {
    id: root
    color: Theme.background

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property int selectedIndex: -1
    property bool addDialogVisible: false
    property bool deleteDialogVisible: false
    property var layoutOptions: ["default", "sidebar", "dashboard", "blank"]
    property var levelOptions: [1, 2, 3, 4, 5]
    property var routes: DBAL.defaultRoutes()

    function updateRoute(index, field, value) {
        routes = DBAL.updateRoute(routes, index, field, value)
        if (selectedIndex === index) { selectedIndex = -1; selectedIndex = index }
        if (useLiveData) DBAL.saveRoute(dbal, routes[index], function() { DBAL.loadRoutes(dbal, function(r) { routes = r }) })
    }
    function addRoute(path, title, level, layout) {
        if (useLiveData) DBAL.createRoute(dbal, { path: path, title: title, level: level, layout: layout, enabled: true, permissions: "authenticated" }, function() { DBAL.loadRoutes(dbal, function(r) { routes = r }) })
        else routes = DBAL.addRouteLocal(routes, path, title, level, layout)
    }
    function deleteRoute() {
        if (selectedIndex < 0 || selectedIndex >= routes.length) return
        if (useLiveData && routes[selectedIndex].id) DBAL.removeRoute(dbal, routes[selectedIndex].id, function() { DBAL.loadRoutes(dbal, function(r) { routes = r }) })
        else routes = DBAL.deleteRouteLocal(routes, selectedIndex)
        selectedIndex = -1; deleteDialogVisible = false
    }
    function moveRoute(from, dir) { var r = DBAL.moveRoute(routes, from, dir); routes = r.routes; selectedIndex = r.newIndex }

    onUseLiveDataChanged: if (useLiveData) DBAL.loadRoutes(dbal, function(r) { routes = r })
    Component.onCompleted: DBAL.loadRoutes(dbal, function(r) { routes = r })

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
                        id: routeList; Layout.fillWidth: true; Layout.fillHeight: true
                        model: routes; clip: true; spacing: 1
                        delegate: CRouteTableRow {
                            routeData: modelData; isSelected: index === selectedIndex; routeIndex: index; routeCount: routes.length
                            onClicked: selectedIndex = (selectedIndex === index ? -1 : index)
                            onMoveUp: moveRoute(index, -1); onMoveDown: moveRoute(index, 1)
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
        id: addDialog; visible: addDialogVisible
        layoutOptions: root.layoutOptions; levelOptions: root.levelOptions
        onAddRoute: function(path, title, level, layout) { root.addRoute(path, title, level, layout) }
    }
    CDeleteConfirmDialog {
        id: deleteDialog; visible: deleteDialogVisible; title: "Delete Route"
        itemName: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].path : ""
        description: "This action cannot be undone. The route will be permanently removed from the configuration."
        onConfirmed: deleteRoute()
    }
}

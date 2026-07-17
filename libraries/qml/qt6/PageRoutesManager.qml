import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "PageRoutesDBAL.js" as DBAL

Rectangle {
    id: root; color: Theme.background
    objectName: "view_page_routes"
    Accessible.role: Accessible.Pane
    Accessible.name: "Page Routes Manager"
    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property int selectedIndex: -1
    property bool addDialogVisible: false
    property bool deleteDialogVisible: false
    readonly property bool hasSel:
        selectedIndex >= 0
        && selectedIndex < routes.length
    property var layoutOptions:
        ["default", "sidebar",
         "dashboard", "blank"]
    property var levelOptions: [1, 2, 3, 4, 5]
    property var routes: DBAL.defaultRoutes()

    function reload() {
        DBAL.loadRoutes(dbal,
            function(r) { routes = r })
    }
    function updateRoute(i, field, value) {
        routes = DBAL.updateRoute(
            routes, i, field, value)
        if (selectedIndex === i) {
            selectedIndex = -1; selectedIndex = i
        }
        if (useLiveData)
            DBAL.saveRoute(dbal, routes[i],
                function() { reload() })
    }
    function addRoute(p, t, l, ly) {
        if (useLiveData)
            DBAL.createRoute(dbal,
                { path: p, title: t, level: l,
                  layout: ly, enabled: true,
                  permissions: "authenticated"
                }, function() { reload() })
        else routes = DBAL.addRouteLocal(
            routes, p, t, l, ly)
    }
    function deleteRoute() {
        if (!hasSel) return
        if (useLiveData
                && routes[selectedIndex].id)
            DBAL.removeRoute(dbal,
                routes[selectedIndex].id,
                function() { reload() })
        else routes = DBAL.deleteRouteLocal(
            routes, selectedIndex)
        selectedIndex = -1
        deleteDialogVisible = false
    }
    function moveRoute(from, dir) {
        var r = DBAL.moveRoute(routes, from, dir)
        routes = r.routes; selectedIndex = r.newIndex
    }
    onUseLiveDataChanged:
        if (useLiveData) reload()
    Component.onCompleted: reload()

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20; spacing: 16
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText {
                variant: "h3"
                text: "Page Routes Manager"
            }
            Item { Layout.fillWidth: true }
            CBadge {
                text: routes.length + " routes"
            }
            CButton {
                text: "Add Route"
                variant: "primary"; size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Add new route"
                Keys.onReturnPressed:
                    addDialogVisible = true
                onClicked: addDialogVisible = true
            }
        }
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true; spacing: 16
            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true
                Layout.preferredWidth: 580
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 0
                    CRouteTableHeader { }
                    CDivider {
                        Layout.fillWidth: true
                    }
                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: routes
                        clip: true; spacing: 1
                        delegate: CRouteTableRow {
                            routeData: modelData
                            isSelected: index
                                === selectedIndex
                            routeIndex: index
                            routeCount:
                                routes.length
                            onClicked:
                                selectedIndex =
                                (selectedIndex
                                === index
                                    ? -1 : index)
                            onMoveUp:
                                moveRoute(
                                    index, -1)
                            onMoveDown:
                                moveRoute(
                                    index, 1)
                        }
                    }
                }
            }
            CRouteEditPanel {
                Layout.preferredWidth: 340
                Layout.fillHeight: true
                visible: hasSel
                route: hasSel
                    ? routes[selectedIndex]
                    : null
                layoutOptions:
                    root.layoutOptions
                levelOptions:
                    root.levelOptions
                onFieldChanged:
                    function(field, value) {
                    updateRoute(selectedIndex,
                        field, value)
                }
                onDeleteRequested:
                    deleteDialogVisible = true
            }
            CCard {
                Layout.preferredWidth: 340
                Layout.fillHeight: true
                visible: !hasSel
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 12
                    Item { Layout.fillHeight: true }
                    CText {
                        variant: "body2"
                        text: "Select a route"
                            + " to edit its"
                            + " configuration."
                        Layout.fillWidth: true
                        horizontalAlignment:
                            Text.AlignHCenter
                        wrapMode: Text.WordWrap
                    }
                    Item { Layout.fillHeight: true }
                }
            }
        }
    }
    CAddRouteDialog {
        visible: addDialogVisible
        layoutOptions: root.layoutOptions
        levelOptions: root.levelOptions
        onAddRoute: function(p, t, l, ly) {
            root.addRoute(p, t, l, ly) }
    }
    CDeleteConfirmDialog {
        visible: deleteDialogVisible
        title: "Delete Route"
        itemName: hasSel
            ? routes[selectedIndex].path : ""
        description: "This action cannot be"
            + " undone. The route will be"
            + " permanently removed."
        onConfirmed: deleteRoute()
    }
}

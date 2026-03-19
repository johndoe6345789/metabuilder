import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    color: Theme.background

    property int selectedIndex: -1
    property bool addDialogVisible: false
    property bool deleteDialogVisible: false

    property string newPath: ""
    property string newTitle: ""
    property int newLevel: 1
    property string newLayout: "default"

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
        if (selectedIndex === index) {
            selectedIndex = -1
            selectedIndex = index
        }
    }

    function addRoute() {
        if (newPath.length === 0 || newTitle.length === 0) return
        var updated = routes.slice()
        updated.push({
            path: newPath,
            title: newTitle,
            level: newLevel,
            layout: newLayout,
            enabled: true,
            permissions: "authenticated"
        })
        routes = updated
        newPath = ""
        newTitle = ""
        newLevel = 1
        newLayout = "default"
        addDialogVisible = false
    }

    function deleteRoute() {
        if (selectedIndex < 0 || selectedIndex >= routes.length) return
        var updated = routes.slice()
        updated.splice(selectedIndex, 1)
        routes = updated
        selectedIndex = -1
        deleteDialogVisible = false
    }

    function moveRoute(fromIndex, direction) {
        var toIndex = fromIndex + direction
        if (toIndex < 0 || toIndex >= routes.length) return
        var updated = routes.slice()
        var temp = updated[fromIndex]
        updated[fromIndex] = updated[toIndex]
        updated[toIndex] = temp
        routes = updated
        selectedIndex = toIndex
    }

    function levelColor(level) {
        if (level <= 1) return "#4caf50"
        if (level === 2) return "#8bc34a"
        if (level === 3) return "#ff9800"
        if (level === 4) return "#f44336"
        return "#9c27b0"
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CText { variant: "h3"; text: "Page Routes Manager" }
            Item { Layout.fillWidth: true }
            CBadge { text: routes.length + " routes" }
            CButton {
                text: "Add Route"
                variant: "primary"
                size: "sm"
                onClicked: addDialogVisible = true
            }
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true
                Layout.preferredWidth: 580

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 0

                    Rectangle {
                        Layout.fillWidth: true
                        height: 40
                        color: Theme.surface
                        radius: 4

                        RowLayout {
                            anchors.fill: parent
                            anchors.leftMargin: 12
                            anchors.rightMargin: 12
                            spacing: 0

                            CText {
                                variant: "caption"
                                text: "ORDER"
                                Layout.preferredWidth: 60
                            }
                            CText {
                                variant: "caption"
                                text: "PATH"
                                Layout.preferredWidth: 120
                            }
                            CText {
                                variant: "caption"
                                text: "TITLE"
                                Layout.preferredWidth: 120
                            }
                            CText {
                                variant: "caption"
                                text: "LEVEL"
                                Layout.preferredWidth: 60
                            }
                            CText {
                                variant: "caption"
                                text: "LAYOUT"
                                Layout.preferredWidth: 100
                            }
                            CText {
                                variant: "caption"
                                text: "STATUS"
                                Layout.fillWidth: true
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    ListView {
                        id: routeList
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: routes
                        clip: true
                        spacing: 1

                        delegate: Rectangle {
                            width: routeList.width
                            height: 48
                            color: index === selectedIndex ? Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.1) : (routeHover.hovered ? Theme.surface : "transparent")
                            radius: 4

                            HoverHandler { id: routeHover }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: selectedIndex = (selectedIndex === index ? -1 : index)
                            }

                            RowLayout {
                                anchors.fill: parent
                                anchors.leftMargin: 12
                                anchors.rightMargin: 12
                                spacing: 0

                                RowLayout {
                                    Layout.preferredWidth: 60
                                    spacing: 2

                                    CButton {
                                        text: "\u25B2"
                                        variant: "ghost"
                                        size: "sm"
                                        enabled: index > 0
                                        onClicked: moveRoute(index, -1)
                                    }
                                    CButton {
                                        text: "\u25BC"
                                        variant: "ghost"
                                        size: "sm"
                                        enabled: index < routes.length - 1
                                        onClicked: moveRoute(index, 1)
                                    }
                                }

                                CText {
                                    variant: "body2"
                                    text: modelData.path
                                    Layout.preferredWidth: 120
                                    color: Theme.primary
                                }

                                CText {
                                    variant: "body2"
                                    text: modelData.title
                                    Layout.preferredWidth: 120
                                }

                                Rectangle {
                                    Layout.preferredWidth: 60
                                    height: 24
                                    width: 32
                                    radius: 12
                                    color: levelColor(modelData.level)

                                    CText {
                                        anchors.centerIn: parent
                                        variant: "caption"
                                        text: modelData.level.toString()
                                        color: "#ffffff"
                                    }
                                }

                                CChip {
                                    text: modelData.layout
                                    Layout.preferredWidth: 100
                                }

                                Rectangle {
                                    Layout.fillWidth: true
                                    height: 10
                                    width: 10
                                    radius: 5
                                    color: modelData.enabled ? "#4caf50" : "#9e9e9e"
                                    Layout.alignment: Qt.AlignVCenter
                                    Layout.preferredWidth: 10
                                    Layout.preferredHeight: 10
                                }
                            }
                        }
                    }
                }
            }

            CCard {
                Layout.preferredWidth: 340
                Layout.fillHeight: true
                visible: selectedIndex >= 0 && selectedIndex < routes.length

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 14

                    CText { variant: "h4"; text: "Edit Route" }
                    CDivider { Layout.fillWidth: true }

                    CText { variant: "caption"; text: "Path" }
                    CTextField {
                        Layout.fillWidth: true
                        text: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].path : ""
                        onTextChanged: {
                            if (selectedIndex >= 0 && selectedIndex < routes.length && text !== routes[selectedIndex].path) {
                                updateRoute(selectedIndex, "path", text)
                            }
                        }
                    }

                    CText { variant: "caption"; text: "Page Title" }
                    CTextField {
                        Layout.fillWidth: true
                        text: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].title : ""
                        onTextChanged: {
                            if (selectedIndex >= 0 && selectedIndex < routes.length && text !== routes[selectedIndex].title) {
                                updateRoute(selectedIndex, "title", text)
                            }
                        }
                    }

                    CText { variant: "caption"; text: "Required Level (1-5)" }
                    CSelect {
                        Layout.fillWidth: true
                        model: levelOptions
                        currentIndex: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].level - 1 : 0
                        onCurrentIndexChanged: {
                            if (selectedIndex >= 0 && selectedIndex < routes.length) {
                                var newLvl = currentIndex + 1
                                if (newLvl !== routes[selectedIndex].level) {
                                    updateRoute(selectedIndex, "level", newLvl)
                                }
                            }
                        }
                    }

                    CText { variant: "caption"; text: "Layout Type" }
                    CSelect {
                        Layout.fillWidth: true
                        model: layoutOptions
                        currentIndex: {
                            if (selectedIndex >= 0 && selectedIndex < routes.length) {
                                return layoutOptions.indexOf(routes[selectedIndex].layout)
                            }
                            return 0
                        }
                        onCurrentIndexChanged: {
                            if (selectedIndex >= 0 && selectedIndex < routes.length) {
                                var newLayoutVal = layoutOptions[currentIndex]
                                if (newLayoutVal !== routes[selectedIndex].layout) {
                                    updateRoute(selectedIndex, "layout", newLayoutVal)
                                }
                            }
                        }
                    }

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12

                        CText { variant: "body2"; text: "Enabled" }
                        Item { Layout.fillWidth: true }
                        CSwitch {
                            checked: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].enabled : false
                            onCheckedChanged: {
                                if (selectedIndex >= 0 && selectedIndex < routes.length && checked !== routes[selectedIndex].enabled) {
                                    updateRoute(selectedIndex, "enabled", checked)
                                }
                            }
                        }
                    }

                    CDivider { Layout.fillWidth: true }

                    CText { variant: "caption"; text: "Permission Rules" }
                    CTextField {
                        Layout.fillWidth: true
                        text: selectedIndex >= 0 && selectedIndex < routes.length ? routes[selectedIndex].permissions : ""
                        onTextChanged: {
                            if (selectedIndex >= 0 && selectedIndex < routes.length && text !== routes[selectedIndex].permissions) {
                                updateRoute(selectedIndex, "permissions", text)
                            }
                        }
                    }

                    CAlert {
                        Layout.fillWidth: true
                        severity: selectedIndex >= 0 && selectedIndex < routes.length && routes[selectedIndex].level >= 4 ? "warning" : "info"
                        text: selectedIndex >= 0 && selectedIndex < routes.length && routes[selectedIndex].level >= 4
                              ? "High privilege route (level " + routes[selectedIndex].level + ")"
                              : "Standard access route"
                    }

                    Item { Layout.fillHeight: true }

                    CButton {
                        text: "Delete Route"
                        variant: "danger"
                        size: "sm"
                        Layout.fillWidth: true
                        onClicked: deleteDialogVisible = true
                    }
                }
            }

            CCard {
                Layout.preferredWidth: 340
                Layout.fillHeight: true
                visible: selectedIndex < 0 || selectedIndex >= routes.length

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 16
                    spacing: 12

                    Item { Layout.fillHeight: true }
                    CText {
                        variant: "body2"
                        text: "Select a route from the table to edit its configuration."
                        Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter
                        wrapMode: Text.WordWrap
                    }
                    Item { Layout.fillHeight: true }
                }
            }
        }
    }

    CDialog {
        id: addDialog
        visible: addDialogVisible
        title: "Add New Route"

        ColumnLayout {
            spacing: 12
            width: 320

            CText { variant: "caption"; text: "Path" }
            CTextField {
                Layout.fillWidth: true
                placeholderText: "/new-page"
                text: newPath
                onTextChanged: newPath = text
            }

            CText { variant: "caption"; text: "Page Title" }
            CTextField {
                Layout.fillWidth: true
                placeholderText: "New Page"
                text: newTitle
                onTextChanged: newTitle = text
            }

            CText { variant: "caption"; text: "Required Level" }
            CSelect {
                Layout.fillWidth: true
                model: levelOptions
                currentIndex: newLevel - 1
                onCurrentIndexChanged: newLevel = currentIndex + 1
            }

            CText { variant: "caption"; text: "Layout Type" }
            CSelect {
                Layout.fillWidth: true
                model: layoutOptions
                currentIndex: layoutOptions.indexOf(newLayout)
                onCurrentIndexChanged: newLayout = layoutOptions[currentIndex]
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: {
                        addDialogVisible = false
                        newPath = ""
                        newTitle = ""
                        newLevel = 1
                        newLayout = "default"
                    }
                }
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Add Route"
                    variant: "primary"
                    enabled: newPath.length > 0 && newTitle.length > 0
                    onClicked: addRoute()
                }
            }
        }
    }

    CDialog {
        id: deleteDialog
        visible: deleteDialogVisible
        title: "Delete Route"

        ColumnLayout {
            spacing: 16
            width: 320

            CAlert {
                Layout.fillWidth: true
                severity: "warning"
                text: selectedIndex >= 0 && selectedIndex < routes.length
                      ? "Are you sure you want to delete \"" + routes[selectedIndex].path + "\"?"
                      : "No route selected."
            }

            CText {
                variant: "body2"
                text: "This action cannot be undone. The route will be permanently removed from the configuration."
                wrapMode: Text.WordWrap
                Layout.fillWidth: true
            }

            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CButton {
                    text: "Cancel"
                    variant: "ghost"
                    onClicked: deleteDialogVisible = false
                }
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Delete"
                    variant: "danger"
                    onClicked: deleteRoute()
                }
            }
        }
    }
}

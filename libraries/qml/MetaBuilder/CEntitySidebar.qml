import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CEntitySidebar.qml - Left sidebar listing entity types with record counts
 *
 * Usage:
 *   CEntitySidebar {
 *       entities: ["User", "Session", "Workflow"]
 *       entityIcons: ({ "User": "\u{1F464}", "Session": "\u{1F513}" })
 *       entityCounts: ({ "User": 8, "Session": 6 })
 *       selectedEntity: "User"
 *       onEntitySelected: function(name) { selectedEntity = name }
 *   }
 */
Rectangle {
    id: root
    objectName: "sidebar_entity"
    Accessible.role: Accessible.Pane
    Accessible.name: "Entity Sidebar"

    property var entities: []          // Array of entity name strings
    property string selectedEntity: "" // Currently selected entity
    property var entityIcons: ({})     // Map of entity name -> icon emoji
    property var entityCounts: ({})    // Map of entity name -> record count
    property bool isDark: Theme.mode === "dark"

    signal entitySelected(string name)

    Layout.preferredWidth: 220
    Layout.fillHeight: true
    color: Theme.surface

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 4

        CText { variant: "h4"; text: "Entities" }
        CText { variant: "caption"; text: "God Panel Level 3"
        color: Theme.textSecondary }

        CDivider { Layout.fillWidth: true; Layout.topMargin: 8
        Layout.bottomMargin: 4 }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: root.entities
            spacing: 2
            clip: true
            delegate: CListItem {
                width: parent ? parent.width : 200
                title: modelData
                subtitle: (root.entityCounts[modelData]
                    || 0) + " records"
                leadingIcon:
                    root.entityIcons[modelData] || ""
                selected:
                    root.selectedEntity === modelData
                activeFocusOnTab: true
                Accessible.role: Accessible.ListItem
                Accessible.name: modelData
                Accessible.description:
                    (root.entityCounts[modelData]
                    || 0) + " records"
                Keys.onReturnPressed:
                    root.entitySelected(modelData)
                Keys.onSpacePressed:
                    root.entitySelected(modelData)
                onClicked: root.entitySelected(modelData)
            }
        }
    }
}

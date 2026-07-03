import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/dbal"
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/ComponentTreeDBAL.js" as CTDBAL

Rectangle {
    id: root
    color: Theme.background
    objectName: "view_component_hierarchy"
    Accessible.role: Accessible.Pane
    Accessible.name: "Component Hierarchy Editor"

    DBALProvider { id: dbal }
    property bool useLiveData: dbal.connected
    property var treeNodes: CTDBAL.loadJson(
        Qt.resolvedUrl(
            "qmllib/MetaBuilder/data/"
            + "component-tree-mock.json"
        )
    ) || []
    property int selectedIndex: -1
    property int nextNodeId: 13

    function loadComponents() {
        CTDBAL.loadComponents(dbal,
            function(parsed, maxId) {
                treeNodes = parsed
                nextNodeId = maxId
            }
        )
    }
    function addChild(parentIdx) {
        var r = CTDBAL.addChild(
            treeNodes, parentIdx, nextNodeId,
            dbal, useLiveData, loadComponents
        )
        if (r) {
            treeNodes = r.nodes
            selectedIndex = r.selectedIndex
            nextNodeId++
        }
    }
    function removeNode(idx) {
        var r = CTDBAL.removeNode(
            treeNodes, idx, dbal, useLiveData,
            loadComponents
        )
        if (r) {
            treeNodes = r.nodes
            selectedIndex = r.selectedIndex
        }
    }
    function updateNode(idx, field, value) {
        treeNodes = CTDBAL.updateNode(
            treeNodes, idx, field, value
        )
        if (useLiveData)
            CTDBAL.saveNode(
                dbal, treeNodes, idx,
                loadComponents
            )
    }

    onUseLiveDataChanged: {
        if (useLiveData) loadComponents()
    }
    Component.onCompleted: { loadComponents() }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20; spacing: 16
        FlexRow {
            Layout.fillWidth: true; spacing: 12
            CText {
                variant: "h3"
                text: "Component Hierarchy Editor"
            }
            Item { Layout.fillWidth: true }
            CChip {
                text: treeNodes.length
                    + " components"
            }
        }
        CAlert {
            Layout.fillWidth: true
            severity: "info"
            text: "Drag-and-drop reordering is"
                + " planned. Use Add Child /"
                + " Remove to modify the tree"
                + " structure."
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            CCard {
                Layout.preferredWidth: 420
                Layout.fillHeight: true
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 10
                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 8
                        CText {
                            variant: "h4"
                            text: "Component Tree"
                        }
                        Item {
                            Layout.fillWidth: true
                        }
                        CButton {
                            text: "Add Child"
                            variant: "primary"
                            size: "sm"
                            enabled: selectedIndex >= 0
                            activeFocusOnTab: true
                            Accessible.role:
                                Accessible.Button
                            Accessible.name:
                                "Add child component"
                            Keys.onReturnPressed:
                                if (enabled)
                                    root.addChild(
                                        selectedIndex)
                            Keys.onSpacePressed:
                                if (enabled)
                                    root.addChild(
                                        selectedIndex)
                            onClicked:
                                root.addChild(
                                    selectedIndex)
                        }
                        CButton {
                            text: "Remove"
                            variant: "danger"
                            size: "sm"
                            enabled: selectedIndex > 0
                            activeFocusOnTab: true
                            Accessible.role:
                                Accessible.Button
                            Accessible.name:
                                "Remove selected"
                                + " component"
                            Keys.onReturnPressed:
                                if (enabled)
                                    root.removeNode(
                                        selectedIndex)
                            Keys.onSpacePressed:
                                if (enabled)
                                    root.removeNode(
                                        selectedIndex)
                            onClicked:
                                root.removeNode(
                                    selectedIndex)
                        }
                    }
                    CDivider {
                        Layout.fillWidth: true
                    }
                    CComponentTypeLegend { }
                    CDivider {
                        Layout.fillWidth: true
                    }
                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: treeNodes
                        clip: true; spacing: 2
                        delegate: CComponentTreeRow {
                            node: modelData
                            isSelected:
                                index
                                === selectedIndex
                            childCount:
                                CTDBAL.childrenCount(
                                    treeNodes, index
                                )
                            onClicked:
                                selectedIndex = index
                        }
                    }
                }
            }

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true
                ColumnLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 12
                    CText {
                        variant: "h4"
                        text: "Component Properties"
                    }
                    CDivider {
                        Layout.fillWidth: true
                    }
                    Item {
                        visible: selectedIndex < 0
                            || selectedIndex
                            >= treeNodes.length
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        CText {
                            anchors.centerIn: parent
                            variant: "body2"
                            text: "Select a component"
                                + " from the tree to"
                                + " view its"
                                + " properties."
                            opacity: 0.5
                        }
                    }
                    CComponentPropertiesPanel {
                        visible: selectedIndex >= 0
                            && selectedIndex
                            < treeNodes.length
                        node: selectedIndex >= 0
                            && selectedIndex
                            < treeNodes.length
                            ? treeNodes[selectedIndex]
                            : null
                        childCount:
                            CTDBAL.childrenCount(
                                treeNodes,
                                selectedIndex
                            )
                        onNameChanged:
                            function(name) {
                                root.updateNode(
                                    selectedIndex,
                                    "name", name
                                )
                            }
                        onTypeChanged:
                            function(type) {
                                root.updateNode(
                                    selectedIndex,
                                    "type", type
                                )
                            }
                        onVisibilityChanged:
                            function(vis) {
                                root.updateNode(
                                    selectedIndex,
                                    "visible", vis
                                )
                            }
                        onAddProp:
                            treeNodes =
                                CTDBAL.addProp(
                                    treeNodes,
                                    selectedIndex
                                )
                        onRemoveProp:
                            function(index) {
                                treeNodes =
                                    CTDBAL.removeProp(
                                        treeNodes,
                                        selectedIndex,
                                        index
                                    )
                            }
                    }
                }
            }
        }
    }
}

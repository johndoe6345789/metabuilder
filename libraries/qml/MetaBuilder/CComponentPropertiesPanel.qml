import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "panel_component_properties"
    Accessible.role: Accessible.Pane
    Accessible.name: node
        ? node.name + " Properties"
        : "Component Properties"
    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 14

    property var node: null
    property int childCount: 0

    signal nameChanged(string name)
    signal typeChanged(string type)
    signal visibilityChanged(bool visible)
    signal addProp()
    signal removeProp(int index)

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        CText { variant: "caption"; text: "NAME" }
        CTextField {
            Layout.fillWidth: true
            text: root.node ? root.node.name : ""
            activeFocusOnTab: true
            Accessible.role: Accessible.EditableText
            Accessible.name: "Component name"
            onTextChanged: {
                if (root.node && text !== root.node.name)
                    root.nameChanged(text)
            }
        }
    }

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        CText { variant: "caption"; text: "TYPE" }
        FlexRow {
            Layout.fillWidth: true
            spacing: 6

            Repeater {
                model: ["container", "layout",
                    "widget", "atom"]
                delegate: CButton {
                    text: modelData
                    size: "sm"
                    variant: (root.node
                        && root.node.type === modelData)
                        ? "primary" : "ghost"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.RadioButton
                    Accessible.name: modelData + " type"
                    Accessible.description:
                        (root.node
                         && root.node.type === modelData)
                        ? "Selected" : "Not selected"
                    Keys.onReturnPressed:
                        root.typeChanged(modelData)
                    Keys.onSpacePressed:
                        root.typeChanged(modelData)
                    onClicked: root.typeChanged(modelData)
                }
            }
        }
    }

    FlexRow {
        Layout.fillWidth: true
        spacing: 12
        CText { variant: "body2"; text: "Visible" }
        Item { Layout.fillWidth: true }
        CSwitch {
            checked: root.node ? root.node.visible : false
            activeFocusOnTab: true
            Accessible.role: Accessible.CheckBox
            Accessible.name: "Component visible"
            Accessible.description: checked
                ? "Component is visible"
                : "Component is hidden"
            onCheckedChanged: {
                if (root.node
                        && checked !== root.node.visible)
                    root.visibleChanged(checked)
            }
        }
    }

    CDivider { Layout.fillWidth: true }

    FlexRow {
        Layout.fillWidth: true
        spacing: 16
        ColumnLayout {
            spacing: 2
            CText { variant: "caption"; text: "DEPTH" }
            CText { variant: "body1"; text: root.node
                ? root.node.depth.toString() : "0" }
        }
        ColumnLayout {
            spacing: 2
            CText { variant: "caption"; text: "CHILDREN" }
            CText { variant: "body1"; text: root.childCount.toString() }
        }
        ColumnLayout {
            spacing: 2
            CText { variant: "caption"; text: "NODE ID" }
            CText { variant: "body1"; text: root.node
                ? root.node.nodeId.toString() : "-" }
        }
    }

    CDivider { Layout.fillWidth: true }

    CComponentPropsList {
        Layout.fillWidth: true
        Layout.fillHeight: true
        props: root.node ? root.node.props : []
        onAddProp: root.addProp()
        onRemoveProp: function(index) { root.removeProp(index) }
    }
}

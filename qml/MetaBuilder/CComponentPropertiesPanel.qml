import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 14

    property var node: null
    property int childCount: 0

    signal nameChanged(string name)
    signal typeChanged(string type)
    signal visibleChanged(bool visible)
    signal addProp()
    signal removeProp(int index)

    // Name field
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        CText { variant: "caption"; text: "NAME" }
        CTextField {
            Layout.fillWidth: true
            text: root.node ? root.node.name : ""
            onTextChanged: {
                if (root.node && text !== root.node.name)
                    root.nameChanged(text)
            }
        }
    }

    // Type selector
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        CText { variant: "caption"; text: "TYPE" }
        FlexRow {
            Layout.fillWidth: true
            spacing: 6

            Repeater {
                model: ["container", "layout", "widget", "atom"]
                delegate: CButton {
                    text: modelData
                    size: "sm"
                    variant: (root.node && root.node.type === modelData) ? "primary" : "ghost"
                    onClicked: root.typeChanged(modelData)
                }
            }
        }
    }

    // Visible toggle
    FlexRow {
        Layout.fillWidth: true
        spacing: 12
        CText { variant: "body2"; text: "Visible" }
        Item { Layout.fillWidth: true }
        CSwitch {
            checked: root.node ? root.node.visible : false
            onCheckedChanged: {
                if (root.node && checked !== root.node.visible)
                    root.visibleChanged(checked)
            }
        }
    }

    CDivider { Layout.fillWidth: true }

    // Info row
    FlexRow {
        Layout.fillWidth: true
        spacing: 16
        ColumnLayout {
            spacing: 2
            CText { variant: "caption"; text: "DEPTH" }
            CText { variant: "body1"; text: root.node ? root.node.depth.toString() : "0" }
        }
        ColumnLayout {
            spacing: 2
            CText { variant: "caption"; text: "CHILDREN" }
            CText { variant: "body1"; text: root.childCount.toString() }
        }
        ColumnLayout {
            spacing: 2
            CText { variant: "caption"; text: "NODE ID" }
            CText { variant: "body1"; text: root.node ? root.node.nodeId.toString() : "-" }
        }
    }

    CDivider { Layout.fillWidth: true }

    // Custom props header
    FlexRow {
        Layout.fillWidth: true
        spacing: 8
        CText { variant: "h4"; text: "Custom Properties" }
        Item { Layout.fillWidth: true }
        CButton {
            text: "Add Prop"
            variant: "ghost"
            size: "sm"
            onClicked: root.addProp()
        }
    }

    // Props list
    ListView {
        Layout.fillWidth: true
        Layout.fillHeight: true
        clip: true
        spacing: 6
        model: root.node ? root.node.props : []

        delegate: CPaper {
            width: parent ? parent.width : 300
            height: 44

            RowLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 8

                CText {
                    variant: "body2"
                    text: modelData.key
                    Layout.preferredWidth: 120
                    opacity: 0.7
                }

                CText {
                    variant: "body1"
                    text: modelData.value
                    Layout.fillWidth: true
                }

                CButton {
                    text: "\u00D7"
                    variant: "ghost"
                    size: "sm"
                    onClicked: root.removeProp(index)
                }
            }
        }
    }
}

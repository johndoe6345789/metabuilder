import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "selector_encryption"
    Accessible.role: Accessible.Grouping
    Accessible.name: "Encryption"

    property var options: ["None", "TLS", "SSL"]
    property int selectedIndex: 1

    signal selectionChanged(int index)

    Layout.fillWidth: true
    spacing: 4

    CText { variant: "caption"; text: "Encryption" }

    RowLayout {
        Layout.fillWidth: true
        spacing: 8

        Repeater {
            model: root.options
            delegate: CButton {
                text: modelData
                variant: root.selectedIndex === index
                    ? "primary" : "ghost"
                size: "sm"
                activeFocusOnTab: true
                Accessible.role: Accessible.RadioButton
                Accessible.name: modelData + " encryption"
                Accessible.description:
                    root.selectedIndex === index
                        ? modelData + " selected"
                        : modelData + " not selected"
                Keys.onReturnPressed: root.selectionChanged(index)
                Keys.onSpacePressed: root.selectionChanged(index)
                onClicked: root.selectionChanged(index)
            }
        }
    }
}

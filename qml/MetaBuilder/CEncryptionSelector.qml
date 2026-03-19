import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: root
    objectName: "selector_encryption"
    Accessible.role: Accessible.RadioGroup
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
                variant: root.selectedIndex === index ? "primary" : "ghost"
                size: "sm"
                onClicked: root.selectionChanged(index)
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var actions: []
    property bool isDark: false

    signal actionClicked(string view)

    variant: "filled"

    CText {
        Layout.fillWidth: true
        variant: "h4"
        text: "Quick Actions"
    }

    Item { Layout.preferredHeight: 12 }

    FlexRow {
        Layout.fillWidth: true
        spacing: 10

        Repeater {
            model: root.actions
            delegate: CButton {
                text: modelData.label
                variant: modelData.variant || "default"
                onClicked: root.actionClicked(modelData.view)
            }
        }
    }
}

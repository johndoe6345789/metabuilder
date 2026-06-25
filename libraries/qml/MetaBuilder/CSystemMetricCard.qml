import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    required property string label
    required property real value
    property string unit: "%"
    property bool isDark: false

    Layout.fillWidth: true

    CText {
        variant: "caption"
        text: root.label
        color: Theme.textSecondary
        Layout.fillWidth: true
    }

    CText {
        variant: "h3"
        text: Math.round(root.value) + root.unit
        Layout.fillWidth: true
    }

    Rectangle {
        Layout.fillWidth: true
        height: 6
        radius: 3
        color: Theme.surfaceVariant

        Rectangle {
            width: parent.width * (root.value / 100)
            height: parent.height
            radius: 3
            color: root.value > 80
                ? Theme.error : root.value > 60 ? Theme.warning : Theme.primary
        }
    }
}

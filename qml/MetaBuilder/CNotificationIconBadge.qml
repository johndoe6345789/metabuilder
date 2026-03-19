import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    property string notificationType: ""

    width: 36
    height: 36
    radius: 18
    Layout.alignment: Qt.AlignTop

    function typeIcon(type) {
        switch (type) {
            case "system":  return "\u2699"
            case "alert":   return "\u26A0"
            case "warning": return "\u26A0"
            case "info":    return "\u2139"
            default:        return "\u2709"
        }
    }

    function typeColor(type) {
        switch (type) {
            case "system":  return "#2196f3"
            case "alert":   return "#f44336"
            case "warning": return "#ff9800"
            case "info":    return "#4caf50"
            default:        return "#9e9e9e"
        }
    }

    color: {
        var c = typeColor(notificationType)
        return Qt.rgba(
            Qt.color(c).r, Qt.color(c).g, Qt.color(c).b, 0.15
        )
    }

    CText {
        anchors.centerIn: parent
        text: root.typeIcon(root.notificationType)
        variant: "body1"
    }
}

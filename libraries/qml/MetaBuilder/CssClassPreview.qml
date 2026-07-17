import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: root

    property var selectedClass: null

    function resolveColor(properties, name, fallback) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === name)
                return properties[i].value
        }
        return fallback
    }

    function resolveRadius(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === "border-radius")
                return parseInt(properties[i].value) || 0
        }
        return 0
    }

    function resolveOpacity(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === "opacity")
                return parseFloat(properties[i].value) || 1.0
        }
        return 1.0
    }

    function resolveFontSize(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].prop === "font-size")
                return parseInt(properties[i].value) || 14
        }
        return 14
    }

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 10

        CText { variant: "h4"; text: "Preview" }

        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: Theme.surface
            radius: 6
            border.color: Theme.border
            border.width: 1

            Grid {
                Layout.fillWidth: true
                rows: Math.ceil(height / 12)
                columns: Math.ceil(width / 12)
                clip: true
                Repeater {
                    model: Math.ceil(parent.parent.width / 12) *
                        Math.ceil(parent.parent.height / 12)
                    Rectangle {
                        width: 12; height: 12
                        color: (Math.floor(index /
                            Math.ceil(
                                parent.parent.width / 12)) + index) % 2 === 0
                               ? "#2a2a2a" : "#333333"
                    }
                }
            }

            Rectangle {
                anchors.centerIn: parent
                width: Math.min(parent.width - 40, 280)
                height: Math.min(parent.height - 20, 72)
                radius: root.selectedClass
                    ? resolveRadius(root.selectedClass.properties) : 0
                opacity: root.selectedClass
                    ? resolveOpacity(root.selectedClass.properties) : 1.0
                color: root.selectedClass
                       ? resolveColor(root.selectedClass.properties,
                           "background-color", Theme.surface)
                       : Theme.surface

                CText {
                    anchors.centerIn: parent
                    variant: "body1"
                    text: root.selectedClass
                        ? "." + root.selectedClass.name : ""
                    color: root.selectedClass
                           ? resolveColor(root.selectedClass.properties,
                               "color", Theme.text)
                           : Theme.text
                    font.pixelSize: root.selectedClass
                        ? resolveFontSize(root.selectedClass.properties) : 14
                }
            }
        }
    }
}

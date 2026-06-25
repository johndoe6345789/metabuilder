import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: previewForm
    spacing: 14

    property string customSurface: "#000000"
    property string customText: "#000000"
    property string customTextSecondary: "#000000"
    property string fontFamily: "Inter"
    property int baseFontSize: 14
    property int radiusSmall: 4

    // Preview header bar
    Rectangle {
        Layout.fillWidth: true
        Layout.preferredHeight: 44
        radius: radiusSmall
        color: customSurface

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 14
            anchors.rightMargin: 14
            spacing: 12

            Text {
                text: "MetaBuilder"
                font.pixelSize: baseFontSize + 2
                font.weight: Font.Bold
                font.family: fontFamily
                color: customText
            }

            Item { Layout.fillWidth: true }

            Repeater {
                model: ["Dashboard", "Settings", "Help"]
                Text {
                    text: modelData
                    font.pixelSize: baseFontSize - 1
                    font.family: fontFamily
                    color: customTextSecondary
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Layouts

Rectangle {
    id: root
    objectName: "luaEditorStatusBar"
    Accessible.role: Accessible.StatusBar
    Accessible.name: "Editor status bar"

    property int lineCount: 0

    Layout.fillWidth: true
    Layout.preferredHeight: 26
    color: "#181825"

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 16

        Text {
            text: "Lua 5.4"
            font.pixelSize: 11
            color: "#a6adc8"
            Accessible.role: Accessible.StaticText
            Accessible.name: "Language: Lua 5.4"
        }
        Text {
            text: "UTF-8"
            font.pixelSize: 11
            color: "#a6adc8"
            Accessible.role: Accessible.StaticText
            Accessible.name: "Encoding: UTF-8"
        }
        Text {
            text: root.lineCount + " lines"
            font.pixelSize: 11
            color: "#a6adc8"
            Accessible.role: Accessible.StaticText
            Accessible.name: root.lineCount + " lines"
        }
        Item { Layout.fillWidth: true }
        Text {
            text: "MetaBuilder Lua Runtime"
            font.pixelSize: 11
            color: "#585b70"
            Accessible.role: Accessible.StaticText
            Accessible.name: "MetaBuilder Lua Runtime"
        }
    }
}

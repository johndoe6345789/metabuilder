import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: codeEditorRoot
    objectName: "luaCodeEditor"
    Accessible.role: Accessible.EditableText
    Accessible.name: "Lua code editor"
    Layout.fillWidth: true
    Layout.fillHeight: true
    color: "#1e1e2e"
    border.color: Theme.border
    border.width: 1

    property alias code: codeEditor.text
    property string scriptName: ""

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Line number gutter + code area
        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "transparent"

            ScrollView {
                anchors.fill: parent
                clip: true

                TextArea {
                    id: codeEditor
                    activeFocusOnTab: true
                    Accessible.role: Accessible.EditableText
                    Accessible.name: "Lua code editor"
                    Accessible.multiLine: true
                    Accessible.description:
                        "Enter Lua script code here"
                    font.family: "Consolas, 'Courier New', monospace"
                    font.pixelSize: 13
                    color: "#cdd6f4"
                    selectionColor: "#45475a"
                    selectedTextColor: "#cdd6f4"
                    wrapMode: TextEdit.NoWrap
                    tabStopDistance: 28
                    padding: 16
                    leftPadding: 56

                    background: Rectangle {
                        color: "transparent"

                        // Line numbers column
                        Column {
                            x: 4
                            y: codeEditor.topPadding
                            width: 44

                            Repeater {
                                model: codeEditor.text.split("\n").length
                                delegate: Text {
                                    width: 40
                                    height: codeEditor.font.pixelSize * 1.4
                                    horizontalAlignment: Text.AlignRight
                                    text: (index + 1).toString()
                                    font.family: codeEditor.font.family
                                    font.pixelSize: codeEditor.font.pixelSize
                                    color: "#585b70"
                                }
                            }
                        }

                        // Gutter separator
                        Rectangle {
                            x: 48
                            y: 0
                            width: 1
                            height: parent.height
                            color: "#313244"
                        }
                    }
                }
            }
        }

        LuaEditorStatusBar {
            lineCount: codeEditor.text.split("\n").length
        }
    }
}

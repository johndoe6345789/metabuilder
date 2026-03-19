import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: outputPanel
    objectName: "luaOutputPanel"
    Accessible.role: Accessible.Pane
    Accessible.name: "Lua output panel"
    Layout.fillWidth: true
    Layout.preferredHeight: 220
    color: Theme.paper
    border.color: Theme.border
    border.width: 1

    property var params: []
    property string testOutput: ""
    property string securityScanResult: ""
    property string scriptName: ""

    signal executeTest(var args)
    signal clearOutput()
    signal paramValueChanged(int index, string value)

    RowLayout {
        anchors.fill: parent
        anchors.margins: 14
        spacing: 14

        LuaTestInputPanel {
            params: outputPanel.params
            onExecuteTest: function(args) { outputPanel.executeTest(args) }
            onParamValueChanged: function(index,
                value) { outputPanel.paramValueChanged(index, value) }
        }

        Rectangle {
            Layout.preferredWidth: 1
            Layout.fillHeight: true
            color: Theme.border
        }

        LuaOutputConsole {
            testOutput: outputPanel.testOutput
            securityScanResult: outputPanel.securityScanResult
            onClearOutput: outputPanel.clearOutput()
        }

        Rectangle {
            Layout.preferredWidth: 1
            Layout.fillHeight: true
            color: Theme.border
        }

        LuaSecurityPanel {
            securityScanResult: outputPanel.securityScanResult
        }
    }
}

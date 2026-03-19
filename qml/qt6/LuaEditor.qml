import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/LuaEditorLogic.js" as Logic

Rectangle {
    id: luaEditorRoot
    color: "transparent"

    property int selectedScriptIndex: 0
    property string testOutput: ""
    property string securityScanResult: ""
    property var scripts: Logic.loadJson(Qt.resolvedUrl("qmllib/MetaBuilder/data/lua-scripts.json"))
    property var snippets: Logic.loadJson(Qt.resolvedUrl("qmllib/MetaBuilder/data/lua-snippets.json"))
    property var exampleCodes: Logic.loadJson(Qt.resolvedUrl("qmllib/MetaBuilder/data/lua-examples.json"))
    property int selectedExampleIndex: 0

    property string currentCode: scripts[selectedScriptIndex].code
    property string currentName: scripts[selectedScriptIndex].name
    property string currentDescription: scripts[selectedScriptIndex].description
    property string currentReturnType: scripts[selectedScriptIndex].returnType
    property var currentParams: Logic.buildParams(scripts[selectedScriptIndex].params)

    onSelectedScriptIndexChanged: {
        var s = scripts[selectedScriptIndex]
        currentCode = s.code; currentName = s.name; currentDescription = s.description; currentReturnType = s.returnType
        currentParams = Logic.buildParams(s.params); testOutput = ""; securityScanResult = ""; selectedExampleIndex = 0
    }

    RowLayout {
        anchors.fill: parent; spacing: 0

        LuaScriptSidebar {
            scripts: luaEditorRoot.scripts; snippets: luaEditorRoot.snippets
            selectedScriptIndex: luaEditorRoot.selectedScriptIndex
            onScriptSelected: function(index) { luaEditorRoot.selectedScriptIndex = index }
            onSnippetInserted: function(code) { currentCode = currentCode + "\n\n" + code }
        }

        ColumnLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0

            Rectangle {
                Layout.fillWidth: true; Layout.preferredHeight: 52; color: Theme.paper; border.color: Theme.border; border.width: 1
                RowLayout {
                    anchors.fill: parent; anchors.leftMargin: 16; anchors.rightMargin: 16; spacing: 12
                    CText { variant: "h4"; text: currentName + ".lua" }
                    CBadge { text: currentReturnType }
                    Item { Layout.fillWidth: true }
                    CSelect {
                        Layout.preferredWidth: 200
                        model: { var labels = []; for (var i = 0; i < exampleCodes.length; i++) { labels.push(exampleCodes[i].label); } return labels; }
                        currentIndex: selectedExampleIndex
                        onCurrentIndexChanged: { selectedExampleIndex = currentIndex; if (currentIndex > 0) currentCode = exampleCodes[currentIndex].code }
                    }
                    CButton { text: "New Script"; variant: "ghost"; onClicked: { currentCode = "-- new_script.lua\n-- Enter your Lua code here\n\nlocal function main()\n    -- TODO: implement\n    return nil\nend\n\nreturn main"; currentName = "new_script"; currentDescription = "New untitled script"; currentReturnType = "nil"; currentParams = []; testOutput = ""; securityScanResult = "" } }
                    CButton { text: "Run"; variant: "primary"; onClicked: testOutput = Logic.runScript(currentName) }
                    CButton { text: "Security Scan"; variant: "danger"; onClicked: securityScanResult = Logic.securityScan(currentName) }
                }
            }

            RowLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0
                LuaCodeEditor { code: currentCode; scriptName: currentName; onCodeChanged: currentCode = code }
                LuaPropertiesPanel {
                    scriptName: currentName; scriptDescription: currentDescription; returnType: currentReturnType
                    params: currentParams; currentCode: luaEditorRoot.currentCode
                    onNameChanged: function(name) { currentName = name }
                    onDescriptionChanged: function(desc) { currentDescription = desc }
                    onReturnTypeChanged: function(rt) { currentReturnType = rt }
                    onParamAdded: { var p = currentParams.slice(); p.push({ name: "param" + (p.length + 1), type: "string", value: "" }); currentParams = p }
                }
            }

            LuaOutputPanel {
                params: currentParams; testOutput: luaEditorRoot.testOutput; securityScanResult: luaEditorRoot.securityScanResult; scriptName: currentName
                onExecuteTest: function(args) { luaEditorRoot.testOutput = Logic.runTest(currentName, args) }
                onClearOutput: { luaEditorRoot.testOutput = ""; luaEditorRoot.securityScanResult = "" }
                onParamValueChanged: function(index, value) { currentParams = Logic.updateParamValue(currentParams, index, value) }
            }
        }
    }
}

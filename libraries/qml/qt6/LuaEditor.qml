import QtQuick; import QtQuick.Controls
import QtQuick.Layouts; import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/LuaEditorLogic.js" as Logic
Rectangle {
    id: root; color: "transparent"
    objectName: "view_lua_editor"
    Accessible.role: Accessible.Pane
    Accessible.name: "Lua Editor"
    property int selIdx: 0
    property string testOutput: ""
    property string scanResult: ""
    property var scripts: Logic.loadJson(
        Qt.resolvedUrl("qmllib/MetaBuilder/data/lua-scripts.json")) || []
    property var snippets: Logic.loadJson(
        Qt.resolvedUrl("qmllib/MetaBuilder/data/lua-snippets.json")) || []
    property var examples: Logic.loadJson(
        Qt.resolvedUrl("qmllib/MetaBuilder/data/lua-examples.json")) || []
    property int selExIdx: 0
    readonly property var _curScript: scripts.length > 0 ? scripts[selIdx] : null
    property string curCode: _curScript ? _curScript.code : ""
    property string curName: _curScript ? _curScript.name : ""
    property string curDesc: _curScript ? _curScript.description : ""
    property string curRet: _curScript ? _curScript.returnType : ""
    property var curParams: _curScript ? Logic.buildParams(_curScript.params) : []
    onSelIdxChanged: {
        var s = scripts.length > 0 ? scripts[selIdx] : null
        if (!s) return
        curCode = s.code; curName = s.name
        curDesc = s.description; curRet = s.returnType
        curParams = Logic.buildParams(s.params)
        testOutput = ""; scanResult = ""; selExIdx = 0
    }
    RowLayout {
        anchors.fill: parent; spacing: 0
        LuaScriptSidebar {
            scripts: root.scripts; snippets: root.snippets
            selectedScriptIndex: root.selIdx
            onScriptSelected: function(i) { root.selIdx = i }
            onSnippetInserted: function(code) {
                curCode = curCode + "\n\n" + code }
        }
        ColumnLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0
            Rectangle {
                Layout.fillWidth: true; Layout.preferredHeight: 52
                color: Theme.paper; border.color: Theme.border; border.width: 1
                RowLayout {
                    anchors.fill: parent; anchors.leftMargin: 16
                    anchors.rightMargin: 16; spacing: 12
                    CText { variant: "h4"; text: curName + ".lua" }
                    CBadge { text: curRet }
                    Item { Layout.fillWidth: true }
                    CSelect {
                        Layout.preferredWidth: 200
                        activeFocusOnTab: true
                        Accessible.role: Accessible.ComboBox
                        Accessible.name: "Load example script"
                        Accessible.description:
                            "Select a Lua example to load"
                        model: Logic.exampleLabels(examples)
                        currentIndex: selExIdx
                        onCurrentIndexChanged: {
                            selExIdx = currentIndex
                            if (currentIndex > 0)
                                curCode = examples[currentIndex].code }
                    }
                    CButton { text: "New Script"; variant: "ghost"
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "New script"
                        Keys.onReturnPressed:
                            Logic.newScript(root)
                        Keys.onSpacePressed:
                            Logic.newScript(root)
                        onClicked: Logic.newScript(root) }
                    CButton { text: "Run"; variant: "primary"
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Run script"
                        Accessible.description:
                            "Execute the current Lua script"
                        Keys.onReturnPressed:
                            testOutput =
                                Logic.runScript(curName)
                        Keys.onSpacePressed:
                            testOutput =
                                Logic.runScript(curName)
                        onClicked:
                            testOutput =
                                Logic.runScript(curName) }
                    CButton { text: "Security Scan"
                        variant: "danger"
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Security scan"
                        Accessible.description:
                            "Scan script for security issues"
                        Keys.onReturnPressed:
                            scanResult =
                                Logic.securityScan(curName)
                        Keys.onSpacePressed:
                            scanResult =
                                Logic.securityScan(curName)
                        onClicked:
                            scanResult =
                                Logic.securityScan(curName) }
                }
            }
            RowLayout {
                Layout.fillWidth: true; Layout.fillHeight: true; spacing: 0
                LuaCodeEditor {
                    code: curCode; scriptName: curName
                    onCodeChanged: curCode = code }
                LuaPropertiesPanel {
                    scriptName: curName; scriptDescription: curDesc
                    returnType: curRet; params: curParams
                    currentCode: root.curCode
                    onNameChanged: function(n) { curName = n }
                    onDescriptionChanged: function(d) { curDesc = d }
                    onReturnTypeEdited: function(rt) { curRet = rt }
                    onParamAdded: {
                        var p = curParams.slice()
                        p.push({
                            name: "param" + (p.length + 1),
                            type: "string", value: "" })
                        curParams = p }
                }
            }
            LuaOutputPanel {
                params: curParams; testOutput: root.testOutput
                securityScanResult: root.scanResult; scriptName: curName
                onExecuteTest: function(args) {
                    root.testOutput = Logic.runTest(curName, args) }
                onClearOutput: { root.testOutput = ""; root.scanResult = "" }
                onParamValueChanged: function(idx, val) {
                    curParams = Logic.updateParamValue(curParams, idx, val) }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: outputConsole
    objectName: "luaOutputConsole"
    Accessible.role: Accessible.Pane
    Accessible.name: "Lua output console"
    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 8

    property string testOutput: ""
    property string securityScanResult: ""

    signal clearOutput()

    FlexRow {
        Layout.fillWidth: true
        CText { variant: "h4"; text: "Output" }
        Item { Layout.fillWidth: true }
        CButton {
            text: "Clear"
            variant: "ghost"
            activeFocusOnTab: true
            Accessible.role: Accessible.Button
            Accessible.name: "Clear output"
            Accessible.description:
                "Clears the output console"
            Keys.onReturnPressed: outputConsole.clearOutput()
            Keys.onSpacePressed: outputConsole.clearOutput()
            onClicked: outputConsole.clearOutput()
        }
    }

    Rectangle {
        Layout.fillWidth: true
        Layout.fillHeight: true
        color: "#1e1e2e"
        radius: 4
        border.color: "#313244"
        border.width: 1

        ScrollView {
            anchors.fill: parent
            anchors.margins: 8
            clip: true

            TextArea {
                readOnly: true
                Accessible.role: Accessible.EditableText
                Accessible.name: "Script output"
                Accessible.multiLine: true
                Accessible.description:
                    "Read-only output from script execution"
                text: {
                    var output = "";
                    if (testOutput) output += testOutput;
                    if (securityScanResult) {
                        if (output) output += "\n\n";
                        output += "--- Security Scan ---\n" +
                            securityScanResult;
                    }
                    if (!output) output = "No output yet. Run a test or
                        security scan.";
                    return output;
                }
                font.family: "Consolas, 'Courier New', monospace"
                font.pixelSize: 12
                color: {
                    if (securityScanResult &&
                        securityScanResult.indexOf("WARN") !== -1)
                        return "#f9e2af";
                    if (testOutput && testOutput.indexOf("SUCCESS") !== -1)
                        return "#a6e3a1";
                    return "#a6adc8";
                }
                wrapMode: TextEdit.Wrap
                background: Rectangle { color: "transparent" }
            }
        }
    }
}

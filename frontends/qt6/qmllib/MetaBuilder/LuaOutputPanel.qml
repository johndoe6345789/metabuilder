import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: outputPanel
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

        // Test inputs
        ColumnLayout {
            Layout.preferredWidth: 280
            Layout.fillHeight: true
            spacing: 8

            CText { variant: "h4"; text: "Test Parameters" }

            ScrollView {
                Layout.fillWidth: true
                Layout.fillHeight: true
                clip: true

                ColumnLayout {
                    width: parent.width
                    spacing: 6

                    Repeater {
                        model: params.length
                        delegate: ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 2

                            CText {
                                variant: "caption"
                                text: params[index].name + " (" + params[index].type + ")"
                            }
                            CTextField {
                                Layout.fillWidth: true
                                placeholderText: "Enter " + params[index].name + "..."
                                text: params[index].value || ""
                                onTextChanged: paramValueChanged(index, text)
                            }
                        }
                    }
                }
            }

            CButton {
                text: "Execute Test"
                variant: "primary"
                Layout.fillWidth: true
                onClicked: {
                    var args = [];
                    for (var i = 0; i < params.length; i++) {
                        args.push(params[i].name + " = " + JSON.stringify(params[i].value || ""));
                    }
                    executeTest(args)
                }
            }
        }

        // Separator
        Rectangle {
            Layout.preferredWidth: 1
            Layout.fillHeight: true
            color: Theme.border
        }

        // Test output
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 8

            FlexRow {
                Layout.fillWidth: true
                CText { variant: "h4"; text: "Output" }
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Clear"
                    variant: "ghost"
                    onClicked: clearOutput()
                }
            }

            // Output area
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
                        text: {
                            var output = "";
                            if (testOutput) output += testOutput;
                            if (securityScanResult) {
                                if (output) output += "\n\n";
                                output += "--- Security Scan ---\n" + securityScanResult;
                            }
                            if (!output) output = "No output yet. Run a test or security scan.";
                            return output;
                        }
                        font.family: "Consolas, 'Courier New', monospace"
                        font.pixelSize: 12
                        color: {
                            if (securityScanResult && securityScanResult.indexOf("WARN") !== -1)
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

        // Separator
        Rectangle {
            Layout.preferredWidth: 1
            Layout.fillHeight: true
            color: Theme.border
        }

        // Security scan results
        ColumnLayout {
            Layout.preferredWidth: 200
            Layout.fillHeight: true
            spacing: 8

            CText { variant: "h4"; text: "Security" }

            CAlert {
                Layout.fillWidth: true
                severity: securityScanResult
                          ? (securityScanResult.indexOf("WARN") !== -1 ? "warning" : "success")
                          : "info"
                text: securityScanResult
                      ? (securityScanResult.indexOf("WARN") !== -1 ? "Advisories found" : "All checks passed")
                      : "Not scanned yet"
            }

            CText { variant: "caption"; text: "SCAN CHECKS" }
            CText { variant: "body2"; text: "os.execute() calls" }
            CText { variant: "body2"; text: "Raw SQL injection" }
            CText { variant: "body2"; text: "File system access" }
            CText { variant: "body2"; text: "Global pollution" }
            CText { variant: "body2"; text: "Unsafe concat" }

            Item { Layout.fillHeight: true }
        }
    }
}

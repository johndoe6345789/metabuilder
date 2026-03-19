import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: testInputPanel
    Layout.preferredWidth: 280
    Layout.fillHeight: true
    spacing: 8

    property var params: []

    signal executeTest(var args)
    signal paramValueChanged(int index, string value)

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
                        text: params[index].name + " (
                            " + params[index].type + ")"
                    }
                    CTextField {
                        Layout.fillWidth: true
                        placeholderText: "Enter " + params[index].name + "..."
                        text: params[index].value || ""
                        onTextChanged: testInputPanel.paramValueChanged(index,
                            text)
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
                args.push(params[i].name + " = " +
                    JSON.stringify(params[i].value || ""));
            }
            testInputPanel.executeTest(args)
        }
    }
}

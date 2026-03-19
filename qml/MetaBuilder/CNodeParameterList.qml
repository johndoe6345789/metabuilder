import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: parameterList
    spacing: 8

    property var node: null

    signal parameterChanged(string key, string value)

    CText { variant: "body2"; text: "Parameters"; font.bold: true }

    ListView {
        Layout.fillWidth: true
        Layout.preferredHeight: Math.min(contentHeight, 200)
        clip: true
        spacing: 8

        model: {
            if (!parameterList.node) return []
            var regEntry = NodeRegistry.nodeType(parameterList.node.type)
            return regEntry ? (regEntry.properties || []) : []
        }

        delegate: ColumnLayout {
            width: parent ? parent.width : 250
            spacing: 4

            CText {
                variant: "caption"
                text: modelData.displayName || modelData.name
            }

            Loader {
                Layout.fillWidth: true
                sourceComponent: {
                    if (modelData.options &&
                        modelData.options.length > 0) return selectComp
                    return textFieldComp
                }
            }

            Component {
                id: textFieldComp
                CTextField {
                    text: parameterList.node && parameterList.node.parameters
                        ? (parameterList.node.parameters[modelData.name] ||
                            modelData.default || "") : ""
                    placeholderText: modelData.description || ""
                    onTextChanged: {
                        if (parameterList.node) {
                            parameterList.parameterChanged(modelData.name, text)
                        }
                    }
                }
            }

            Component {
                id: selectComp
                CSelect {
                    model: {
                        var opts = modelData.options || []
                        var labels = []
                        for (var i = 0; i < opts.length; i++) {
                            labels.push(opts[i].name || opts[i].value || "")
                        }
                        return labels
                    }
                }
            }
        }
    }
}

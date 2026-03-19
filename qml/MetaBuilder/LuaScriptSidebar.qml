import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: sidebar
    Layout.preferredWidth: 220
    Layout.fillHeight: true
    color: Theme.paper
    border.color: Theme.border
    border.width: 1

    property var scripts: []
    property var snippets: []
    property int selectedScriptIndex: 0
    property bool showSnippets: false

    signal scriptSelected(int index)
    signal snippetInserted(string code)

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 4

        CText { variant: "h4"; text: "Lua Scripts" }
        CText { variant: "caption"; text: scripts.length + " scripts loaded" }

        CDivider { Layout.fillWidth: true; Layout.topMargin: 8
        Layout.bottomMargin: 4 }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: scripts
            spacing: 2
            clip: true
            delegate: CListItem {
                width: parent ? parent.width : 200
                title: modelData.name
                subtitle: modelData.returnType + " | " +
                    modelData.params.length + " param" + (
                        modelData.params.length !== 1 ? "s" : "")
                selected: selectedScriptIndex === index
                onClicked: scriptSelected(index)
            }
        }

        CDivider { Layout.fillWidth: true; Layout.topMargin: 4
        Layout.bottomMargin: 4 }

        // Snippet library toggle
        CButton {
            text: showSnippets ? "Hide Snippets" : "Snippet Library"
            variant: "ghost"
            Layout.fillWidth: true
            onClicked: showSnippets = !showSnippets
        }

        // Snippet library
        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2
            visible: showSnippets

            Repeater {
                model: snippets
                delegate: CListItem {
                    width: parent ? parent.width : 200
                    title: modelData.label
                    subtitle: "Insert snippet"
                    onClicked: snippetInserted(modelData.code)
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CDialog {
    id: root
    objectName: "dialog_add_route"

    property string newPath: ""
    property string newTitle: ""
    property int newLevel: 1
    property string newLayout: "default"
    property var layoutOptions: ["default", "sidebar", "dashboard", "blank"]
    property var levelOptions: [1, 2, 3, 4, 5]

    signal addRoute(string path, string title, int level, string layout)

    title: "Add New Route"

    function reset() {
        newPath = ""
        newTitle = ""
        newLevel = 1
        newLayout = "default"
    }

    ColumnLayout {
        spacing: 12
        width: 320

        CText { variant: "caption"; text: "Path" }
        CTextField {
            Layout.fillWidth: true
            placeholderText: "/new-page"
            text: root.newPath
            Accessible.role: Accessible.EditableText
            Accessible.name: "Route path"
            onTextChanged: root.newPath = text
        }

        CText {
            variant: "caption"; text: "Page Title"
        }
        CTextField {
            Layout.fillWidth: true
            placeholderText: "New Page"
            text: root.newTitle
            Accessible.role: Accessible.EditableText
            Accessible.name: "Page title"
            onTextChanged: root.newTitle = text
        }

        CText {
            variant: "caption"
            text: "Required Level"
        }
        CSelect {
            Layout.fillWidth: true
            model: root.levelOptions
            currentIndex: root.newLevel - 1
            Accessible.role: Accessible.ComboBox
            Accessible.name: "Required access level"
            onCurrentIndexChanged:
                root.newLevel = currentIndex + 1
        }

        CText {
            variant: "caption"; text: "Layout Type"
        }
        CSelect {
            Layout.fillWidth: true
            model: root.layoutOptions
            currentIndex:
                root.layoutOptions.indexOf(
                    root.newLayout)
            Accessible.role: Accessible.ComboBox
            Accessible.name: "Layout type"
            onCurrentIndexChanged:
                root.newLayout =
                    root.layoutOptions[currentIndex]
        }

        FlexRow {
            Layout.fillWidth: true
            spacing: 12

            CButton {
                text: "Cancel"
                variant: "ghost"
                Accessible.role: Accessible.Button
                Accessible.name: "Cancel"
                Keys.onReturnPressed: {
                    root.reset()
                    root.visible = false
                }
                Keys.onSpacePressed: {
                    root.reset()
                    root.visible = false
                }
                onClicked: {
                    root.reset()
                    root.visible = false
                }
            }
            Item { Layout.fillWidth: true }
            CButton {
                text: "Add Route"
                variant: "primary"
                enabled:
                    root.newPath.length > 0 &&
                    root.newTitle.length > 0
                Accessible.role: Accessible.Button
                Accessible.name: "Add route"
                Keys.onReturnPressed: {
                    if (!enabled) return
                    root.addRoute(
                        root.newPath,
                        root.newTitle,
                        root.newLevel,
                        root.newLayout)
                    root.reset()
                    root.visible = false
                }
                Keys.onSpacePressed: {
                    if (!enabled) return
                    root.addRoute(
                        root.newPath,
                        root.newTitle,
                        root.newLevel,
                        root.newLayout)
                    root.reset()
                    root.visible = false
                }
                onClicked: {
                    root.addRoute(
                        root.newPath,
                        root.newTitle,
                        root.newLevel,
                        root.newLayout)
                    root.reset()
                    root.visible = false
                }
            }
        }
    }
}

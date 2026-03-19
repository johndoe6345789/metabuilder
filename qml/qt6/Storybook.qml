import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"

Rectangle {
    id: storybookRoot
    color: Theme.background
    objectName: "view_storybook"
    Accessible.role: Accessible.Pane
    Accessible.name: "Storybook"

    property string selectedComponent: "Button"
    property bool outlinedMode: false
    property bool showSnackbar: true
    property var componentList: []

    StorybookSamples {
        id: samples
        outlinedMode: root.outlinedMode
        showSnackbar: root.showSnackbar
    }

    Component.onCompleted: {
        var xhr = new XMLHttpRequest()
        xhr.open("GET",
            "../../frontends/qt6/config"
            + "/storybook-components.json")
        xhr.onreadystatechange = function() {
            if (xhr.readyState
                === XMLHttpRequest.DONE
                && xhr.status === 200)
                componentList = JSON.parse(
                    xhr.responseText)
        }
        xhr.send()
    }

    RowLayout {
        id: root
        anchors.fill: parent
        anchors.margins: 24
        spacing: 20

        StorybookSidebar {
            componentList:
                parent.parent.componentList
            selectedComponent:
                parent.parent.selectedComponent
            outlinedMode:
                parent.parent.outlinedMode
            showSnackbar:
                parent.parent.showSnackbar
            onComponentSelected:
                function(name) {
                selectedComponent = name
            }
            onOutlinedModeChanged:
                function(v) {
                outlinedMode = v
            }
            onShowSnackbarChanged:
                function(v) {
                showSnackbar = v
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText {
                    variant: "h3"
                    text: selectedComponent
                        + " preview"
                }
                Item {
                    Layout.fillWidth: true
                }
                CBadge { text: "Live" }
            }

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true
                variant: "outlined"

                Loader {
                    anchors.fill: parent
                    anchors.margins: 24
                    sourceComponent:
                        samples.sampleComponent(
                            selectedComponent)
                }
            }

            CText {
                variant: "caption"
                text: "Select a component"
                    + " on the left to"
                    + " inspect interactions"
                    + ", props, and styling."
            }
        }
    }
}

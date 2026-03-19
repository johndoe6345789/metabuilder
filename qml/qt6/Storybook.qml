import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"

Rectangle {
    color: Theme.background

    property string selectedComponent: "Button"
    property bool outlinedMode: false
    property bool showSnackbar: true

    StorybookSamples {
        id: samples
        outlinedMode: root.outlinedMode
        showSnackbar: root.showSnackbar
    }

    RowLayout {
        id: root
        anchors.fill: parent
        anchors.margins: 24
        spacing: 20

        // Sidebar
        CCard {
            Layout.preferredWidth: 260
            Layout.fillHeight: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 18
                spacing: 12

                CText { variant: "h4"; text: "Components" }

                ListView {
                    Layout.fillHeight: true
                    Layout.fillWidth: true
                    model: ListModel {
                        ListElement { name: "Button";    desc: "Primary/outline actions" }
                        ListElement { name: "Card";      desc: "Elevated surfaces" }
                        ListElement { name: "Checkbox";  desc: "Binary toggle" }
                        ListElement { name: "Accordion"; desc: "Expandable sections" }
                        ListElement { name: "Tabs";      desc: "Navigation tabs" }
                        ListElement { name: "Snackbar";  desc: "Transient notices" }
                        ListElement { name: "Avatar";    desc: "Identity badges" }
                        ListElement { name: "MOD Player"; desc: "Play tracker tunes" }
                        ListElement { name: "Typography"; desc: "Styled text" }
                        ListElement { name: "Alert";     desc: "Status messages" }
                    }
                    spacing: 4
                    delegate: CListItem {
                        width: parent ? parent.width : 220
                        title: model.name
                        subtitle: model.desc
                        selected: selectedComponent === model.name
                        onClicked: selectedComponent = model.name
                    }
                }

                CDivider { Layout.fillWidth: true }

                ColumnLayout {
                    spacing: 8
                    CText { variant: "caption"; text: "Playground knobs" }
                    CSwitch {
                        text: "Outlined mode"
                        checked: outlinedMode
                        onCheckedChanged: outlinedMode = checked
                    }
                    CSwitch {
                        text: "Show snackbar"
                        checked: showSnackbar
                        onCheckedChanged: showSnackbar = checked
                    }
                }
            }
        }

        // Preview
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText { variant: "h3"; text: selectedComponent + " preview" }
                Item { Layout.fillWidth: true }
                CBadge { text: "Live" }
            }

            CCard {
                Layout.fillWidth: true
                Layout.fillHeight: true
                variant: "outlined"

                Loader {
                    anchors.fill: parent
                    anchors.margins: 24
                    sourceComponent: samples.sampleComponent(selectedComponent)
                }
            }

            CText {
                variant: "caption"
                text: "Select a component on the left to inspect interactions, props, and styling."
            }
        }
    }
}

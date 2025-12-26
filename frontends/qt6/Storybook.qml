import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "qmllib/Material" as Material

ApplicationWindow {
    visible: true
    width: 1400
    height: 900
    title: "MetaBuilder Material Storybook"
    color: Material.MaterialPalette.background

    property string selectedComponent: "Button"
    property bool outlinedButtons: false
    property bool showSnackbar: true

    RowLayout {
        anchors.fill: parent
        anchors.margins: 24
        spacing: 20

        // Sidebar navigation
        Rectangle {
            width: 260
            color: Material.MaterialPalette.surface
            radius: 16
            border.color: Material.MaterialPalette.outline
            Layout.fillHeight: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 18
                spacing: 16

                Text {
                    text: "Components"
                    font.pixelSize: 20
                    font.bold: true
                    color: Material.MaterialPalette.onSurface
                }

                ListView {
                    id: componentList
                    Layout.fillHeight: true
                    Layout.fillWidth: true
                    model: ListModel {
                        ListElement { name: "Button"; desc: "Primary/outline actions" }
                        ListElement { name: "Card"; desc: "Elevated surfaces" }
                        ListElement { name: "Checkbox"; desc: "Binary toggle" }
                        ListElement { name: "Accordion"; desc: "Expandable sections" }
                        ListElement { name: "Grid"; desc: "Responsive layout" }
                        ListElement { name: "Snackbar"; desc: "Transient notices" }
                        ListElement { name: "Menu"; desc: "Dropdown actions" }
                        ListElement { name: "Avatar"; desc: "Identity badges" }
                        ListElement { name: "MOD Player"; desc: "Play tracker tunes" }
                        ListElement { name: "Typography"; desc: "Styled text" }
                    }
                    delegate: Rectangle {
                        width: parent.width
                        height: 60
                        radius: 12
                        color: selectedComponent === model.name ? Material.MaterialPalette.primaryContainer : "transparent"
                        border.color: Material.MaterialPalette.outline
                        border.width: 1
                        anchors.margins: 2
                        MouseArea {
                            anchors.fill: parent
                            onClicked: selectedComponent = model.name
                        }
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 10
                            spacing: 4
                            Text {
                                text: model.name
                                font.pixelSize: 16
                                font.bold: true
                                color: Material.MaterialPalette.onSurface
                            }
                            Text {
                                text: model.desc
                                font.pixelSize: 12
                                color: Material.MaterialPalette.onSurface
                                opacity: 0.7
                            }
                        }
                    }
                }

                Material.MaterialDivider { Layout.fillWidth: true }

                ColumnLayout {
                    spacing: 8
                    Text { text: "Playground knobs"; font.pixelSize: 14; color: Material.MaterialPalette.onSurface }
                    RowLayout {
                        spacing: 12
                        Material.MaterialSwitch {
                            label: "Outlined buttons"
                            checked: outlinedButtons
                            onCheckedChanged: outlinedButtons = checked
                        }
                        Material.MaterialSwitch {
                            label: "Show snackbar"
                            checked: showSnackbar
                            onCheckedChanged: showSnackbar = checked
                        }
                    }
                }
            }
        }

        // Preview section
        ColumnLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 16

            RowLayout {
                Layout.fillWidth: true
                spacing: 12
                Text {
                    text: selectedComponent + " preview"
                    font.pixelSize: 28
                    font.bold: true
                    color: Material.MaterialPalette.onSurface
                }
                Item { Layout.fillWidth: true }
                Material.MaterialBadge { text: "Live" }
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: Material.MaterialPalette.surfaceVariant
                radius: 16
                border.color: Material.MaterialPalette.outline

                Loader {
                    id: previewLoader
                    anchors.fill: parent
                    anchors.margins: 24
                    sourceComponent: sampleComponent(selectedComponent)
                }
            }

            Text {
                text: "Select a component on the left to inspect interactions, props, and styling."
                font.pixelSize: 14
                color: Material.MaterialPalette.onSurface
                opacity: 0.75
            }
        }
    }

    function sampleComponent(name) {
        switch(name) {
        case "Button": return buttonSample
        case "Card": return cardSample
        case "Checkbox": return checkboxSample
        case "Accordion": return accordionSample
        case "Grid": return gridSample
        case "Snackbar": return snackbarSample
        case "Menu": return menuSample
        case "Avatar": return avatarSample
        case "MOD Player": return modPlayerSample
        case "Typography": return typographySample
        default: return emptySample
        }
    }

    Component {
        id: buttonSample
        RowLayout {
            spacing: 12
            Material.MaterialButton { text: "Primary"; outlined: outlinedButtons }
            Material.MaterialButton { text: "Secondary"; outlined: true }
            Material.MaterialIconButton { iconSource: "qrc:/icons/menu.svg" }
        }
    }

    Component {
        id: cardSample
        Material.MaterialCard {
            width: parent ? parent.width - 96 : 400
            contentItem: ColumnLayout {
                spacing: 12
                Text { text: "Card headline"; font.pixelSize: 20; color: Material.MaterialPalette.onSurface }
                Text { text: "Cards provide a container for grouped content, actions, and media."; wrapMode: Text.Wrap; color: Material.MaterialPalette.onSurface }
                RowLayout { spacing: 10
                    Material.MaterialButton { text: "Action" }
                    Material.MaterialButton { text: "Dismiss"; outlined: true }
                }
            }
        }
    }

    Component {
        id: checkboxSample
        ColumnLayout {
            spacing: 12
            Material.MaterialCheckbox {
                label: "Accept terms"
                checked: true
            }
            Material.MaterialCheckbox { label: "Enable tracking" }
        }
    }

    Component {
        id: accordionSample
        Material.MaterialAccordion {
            headerText: "Expandable details"
            summaryText: "MetaBuilder uses structured seeds to orchestrate the UI."
            expanded: true
            Loader {
                sourceComponent: Component {
                    Text {
                        text: "Content appears inside the accordion when expanded."
                        wrapMode: Text.Wrap
                        color: Material.MaterialPalette.onSurface
                    }
                }
            }
        }
    }

    Component {
        id: gridSample
        Material.MaterialGrid {
            columns: 3
            Repeater {
                model: 6
                delegate: Material.MaterialCard {
                    width: 140
                    contentItem: ColumnLayout {
                        spacing: 6
                        Text { text: "Cell " + (index+1); font.pixelSize: 14; color: Material.MaterialPalette.onSurface }
                        Material.MaterialBadge { text: "beta"; accent: true }
                    }
                }
            }
        }
    }

    Component {
        id: snackbarSample
        Material.MaterialSnackbar {
            message: "Material Storybook ready!"
            actionText: "Undo"
            open: showSnackbar
            onActionTriggered: showSnackbar = false
        }
    }

    Component {
        id: menuSample
        Material.MaterialMenu {
            x: 0
            y: 0
            MenuItem { text: "Command palette" }
            MenuItem { text: "Settings" }
            MenuItem { text: "Sign out" }
        }
    }

    Component {
        id: avatarSample
        RowLayout {
            spacing: 12
            Material.MaterialAvatar { initials: "MB" }
            Material.MaterialAvatar { source: "qrc:/icons/avatar.svg" }
        }
    }

    Component {
        id: typographySample
        ColumnLayout {
            spacing: 8
            Material.MaterialTypography { variant: "h1"; text: "Headline" }
            Material.MaterialTypography { variant: "h3"; text: "Section title" }
            Material.MaterialTypography { variant: "body1"; text: "Body copy demonstrates Material font styling." }
        }
    }

    Component {
        id: modPlayerSample
        ModPlayerPanel {}
    }

    Component {
        id: emptySample
        Text {
            text: "Select a component from the sidebar."
            color: Material.MaterialPalette.onSurface
        }
    }
}

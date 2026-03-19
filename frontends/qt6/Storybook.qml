import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: Theme.background

    property string selectedComponent: "Button"
    property bool outlinedMode: false
    property bool showSnackbar: true

    RowLayout {
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
                    sourceComponent: sampleComponent(selectedComponent)
                }
            }

            CText {
                variant: "caption"
                text: "Select a component on the left to inspect interactions, props, and styling."
            }
        }
    }

    function sampleComponent(name) {
        switch(name) {
        case "Button": return buttonSample
        case "Card": return cardSample
        case "Checkbox": return checkboxSample
        case "Accordion": return accordionSample
        case "Tabs": return tabsSample
        case "Snackbar": return snackbarSample
        case "Avatar": return avatarSample
        case "MOD Player": return modPlayerSample
        case "Typography": return typographySample
        case "Alert": return alertSample
        default: return emptySample
        }
    }

    Component {
        id: buttonSample
        FlexRow {
            spacing: 12
            CButton { text: "Primary"; variant: "primary" }
            CButton { text: "Secondary"; variant: "secondary" }
            CButton { text: "Ghost"; variant: "ghost" }
            CButton { text: "Danger"; variant: "danger" }
            CIconButton { iconText: "+" }
        }
    }

    Component {
        id: cardSample
        CCard {
            width: parent ? parent.width - 96 : 400
            title: "Card headline"
            CText { text: "Cards provide a container for grouped content, actions, and media."; wrapMode: Text.Wrap }
            FlexRow {
                spacing: 10
                CButton { text: "Action"; variant: "primary" }
                CButton { text: "Dismiss"; variant: "ghost" }
            }
        }
    }

    Component {
        id: checkboxSample
        ColumnLayout {
            spacing: 12
            CCheckbox { text: "Accept terms"; checked: true }
            CCheckbox { text: "Enable tracking" }
        }
    }

    Component {
        id: accordionSample
        CAccordion {
            width: parent ? parent.width : 400
            CAccordionItem {
                title: "Expandable details"
                expanded: true
                CText { text: "Content appears inside the accordion when expanded." }
            }
            CAccordionItem {
                title: "Another section"
                CText { text: "MetaBuilder uses structured seeds to orchestrate the UI." }
            }
        }
    }

    Component {
        id: tabsSample
        ColumnLayout {
            spacing: 12
            CTabBar {
                Layout.fillWidth: true
                tabs: [{ label: "Overview" }, { label: "Settings" }, { label: "Logs" }]
            }
            CText { text: "Tab content renders here based on selection." }
        }
    }

    Component {
        id: snackbarSample
        CSnackbar {
            message: "Material Storybook ready!"
            visible: showSnackbar
        }
    }

    Component {
        id: avatarSample
        FlexRow {
            spacing: 12
            CAvatar { initials: "MB" }
            CAvatar { initials: "QT" }
        }
    }

    Component {
        id: typographySample
        ColumnLayout {
            spacing: 8
            CText { variant: "h1"; text: "Headline" }
            CText { variant: "h3"; text: "Section title" }
            CText { variant: "body1"; text: "Body copy demonstrates Material font styling." }
            CText { variant: "caption"; text: "Caption text for metadata" }
        }
    }

    Component {
        id: modPlayerSample
        ModPlayerPanel {}
    }

    Component {
        id: alertSample
        ColumnLayout {
            spacing: 12
            CAlert { severity: "success"; text: "Operation completed successfully" }
            CAlert { severity: "warning"; text: "Disk usage above 80%" }
            CAlert { severity: "error"; text: "Connection to DBAL failed" }
            CAlert { severity: "info"; text: "New package version available" }
        }
    }

    Component {
        id: emptySample
        CText { text: "Select a component from the sidebar." }
    }
}

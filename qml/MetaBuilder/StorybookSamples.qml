import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

QtObject {
    id: samples

    property bool outlinedMode: false
    property bool showSnackbar: true

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

    property Component buttonSample: Component {
        FlexRow {
            spacing: 12
            CButton { text: "Primary"; variant: "primary" }
            CButton { text: "Secondary"; variant: "secondary" }
            CButton { text: "Ghost"; variant: "ghost" }
            CButton { text: "Danger"; variant: "danger" }
            CIconButton { iconText: "+" }
        }
    }

    property Component cardSample: Component {
        CCard {
            width: parent ? parent.width - 96 : 400
            title: "Card headline"
            CText {
                text: "Cards provide a container for"
                    + " grouped content, actions,"
                    + " and media."
                wrapMode: Text.Wrap
            }
            FlexRow {
                spacing: 10
                CButton { text: "Action"; variant: "primary" }
                CButton { text: "Dismiss"; variant: "ghost" }
            }
        }
    }

    property Component checkboxSample: Component {
        ColumnLayout {
            spacing: 12
            CCheckbox { text: "Accept terms"; checked: true }
            CCheckbox { text: "Enable tracking" }
        }
    }

    property Component accordionSample: Component {
        CAccordion {
            width: parent ? parent.width : 400
            CAccordionItem {
                title: "Expandable details"
                expanded: true
                CText {
                    text: "Content appears inside"
                        + " the accordion when expanded."
                }
            }
            CAccordionItem {
                title: "Another section"
                CText {
                    text: "MetaBuilder uses structured"
                        + " seeds to orchestrate the UI."
                }
            }
        }
    }

    property Component tabsSample: Component {
        ColumnLayout {
            spacing: 12
            CTabBar {
                Layout.fillWidth: true
                tabs: [
                    { label: "Overview" },
                    { label: "Settings" },
                    { label: "Logs" }
                ]
            }
            CText { text: "Tab content renders here based on selection." }
        }
    }

    property Component snackbarSample: Component {
        CSnackbar {
            message: "Material Storybook ready!"
            visible: samples.showSnackbar
        }
    }

    property Component avatarSample: Component {
        FlexRow {
            spacing: 12
            CAvatar { initials: "MB" }
            CAvatar { initials: "QT" }
        }
    }

    property Component typographySample: Component {
        ColumnLayout {
            spacing: 8
            CText { variant: "h1"; text: "Headline" }
            CText { variant: "h3"; text: "Section title" }
            CText {
                variant: "body1"
                text: "Body copy demonstrates"
                    + " Material font styling."
            }
            CText {
                variant: "caption"
                text: "Caption text for metadata"
            }
        }
    }

    property Component modPlayerSample: Component {
        ModPlayerPanel {}
    }

    property Component alertSample: Component {
        ColumnLayout {
            spacing: 12
            CAlert { severity: "success"
            text: "Operation completed successfully" }
            CAlert { severity: "warning"; text: "Disk usage above 80%" }
            CAlert { severity: "error"; text: "Connection to DBAL failed" }
            CAlert { severity: "info"; text: "New package version available" }
        }
    }

    property Component emptySample: Component {
        CText { text: "Select a component from the sidebar." }
    }
}

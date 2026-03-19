import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: materialRoot
    color: Theme.background
    objectName: "view_material_landing"
    Accessible.role: Accessible.Pane
    Accessible.name: "Material Landing"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 32
        spacing: 24

        CText { variant: "h2"; text: "Material-style UI in Qt Quick" }

        FlexRow {
            spacing: 16
            CButton {
                text: "Primary action"; variant: "primary"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Primary action"
            }
            CButton {
                text: "Ghost action"; variant: "ghost"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Ghost action"
            }
            CButton {
                text: "Danger"; variant: "danger"
                activeFocusOnTab: true
                Accessible.role: Accessible.Button
                Accessible.name: "Danger action"
            }
        }

        FlexRow {
            spacing: 16
            CTextField {
                placeholderText: "Email address"
                Layout.preferredWidth: 240
                activeFocusOnTab: true
                Accessible.role: Accessible.EditableText
                Accessible.name: "Email address"
            }
            CTextField {
                placeholderText: "Your role"
                Layout.preferredWidth: 180
                activeFocusOnTab: true
                Accessible.role: Accessible.EditableText
                Accessible.name: "Your role"
            }
        }

        FlexRow {
            spacing: 12
            CChip {
                text: "Design"
                Accessible.role: Accessible.StaticText
                Accessible.name: "Design"
            }
            CChip {
                text: "Data"
                Accessible.role: Accessible.StaticText
                Accessible.name: "Data"
            }
            CChip {
                text: "Runtime"
                Accessible.role: Accessible.StaticText
                Accessible.name: "Runtime"
            }
            CChip {
                text: "Automation"
                Accessible.role: Accessible.StaticText
                Accessible.name: "Automation"
            }
        }

        CDivider { Layout.fillWidth: true }

        CPaper {
            Layout.fillWidth: true
            Accessible.role: Accessible.Grouping
            Accessible.name: "Paper surface"
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 14

                CText { variant: "h4"; text: "Paper surface" }
                CText {
                    variant: "body1"
                    text: "Use surfaces to group related controls, apply
                        elevation, and keep spacing consistent with Material
                            principles."
                    wrapMode: Text.Wrap
                    Layout.fillWidth: true
                }
                FlexRow {
                    spacing: 12
                    CButton {
                        text: "Continue"
                        variant: "primary"
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Continue"
                    }
                    CButton {
                        text: "Cancel"
                        variant: "ghost"
                        activeFocusOnTab: true
                        Accessible.role: Accessible.Button
                        Accessible.name: "Cancel"
                    }
                }
            }
        }

        CCard {
            Layout.fillWidth: true
            title: "Card headline"
            Accessible.role: Accessible.Grouping
            Accessible.name: "Card headline"
            CText {
                text: "Cards can load any content, here we show simple stacked
                    text with Material spacing."
                wrapMode: Text.Wrap
            }
        }

        ColumnLayout {
            spacing: 10
            CText { variant: "subtitle1"; text: "Badge samples" }
            FlexRow {
                spacing: 10
                CBadge {
                    text: "alpha"
                    Accessible.role: Accessible.StaticText
                    Accessible.name: "alpha"
                }
                CBadge {
                    text: "stable"
                    Accessible.role: Accessible.StaticText
                    Accessible.name: "stable"
                }
                CBadge {
                    text: "live"
                    Accessible.role: Accessible.StaticText
                    Accessible.name: "live"
                }
            }
        }
    }
}

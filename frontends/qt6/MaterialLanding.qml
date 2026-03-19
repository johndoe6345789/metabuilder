import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    color: Theme.background

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 32
        spacing: 24

        CText { variant: "h2"; text: "Material-style UI in Qt Quick" }

        FlexRow {
            spacing: 16
            CButton { text: "Primary action"; variant: "primary" }
            CButton { text: "Ghost action"; variant: "ghost" }
            CButton { text: "Danger"; variant: "danger" }
        }

        FlexRow {
            spacing: 16
            CTextField { placeholderText: "Email address"; Layout.preferredWidth: 240 }
            CTextField { placeholderText: "Your role"; Layout.preferredWidth: 180 }
        }

        FlexRow {
            spacing: 12
            CChip { text: "Design" }
            CChip { text: "Data" }
            CChip { text: "Runtime" }
            CChip { text: "Automation" }
        }

        CDivider { Layout.fillWidth: true }

        CPaper {
            Layout.fillWidth: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 16
                spacing: 14

                CText { variant: "h4"; text: "Paper surface" }
                CText {
                    variant: "body1"
                    text: "Use surfaces to group related controls, apply elevation, and keep spacing consistent with Material principles."
                    wrapMode: Text.Wrap
                    Layout.fillWidth: true
                }
                FlexRow {
                    spacing: 12
                    CButton { text: "Continue"; variant: "primary" }
                    CButton { text: "Cancel"; variant: "ghost" }
                }
            }
        }

        CCard {
            Layout.fillWidth: true
            title: "Card headline"
            CText {
                text: "Cards can load any content, here we show simple stacked text with Material spacing."
                wrapMode: Text.Wrap
            }
        }

        ColumnLayout {
            spacing: 10
            CText { variant: "subtitle1"; text: "Badge samples" }
            FlexRow {
                spacing: 10
                CBadge { text: "alpha" }
                CBadge { text: "stable" }
                CBadge { text: "live" }
            }
        }
    }
}

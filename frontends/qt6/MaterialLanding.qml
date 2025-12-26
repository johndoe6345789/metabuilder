import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "qmllib/Material" as Material

ApplicationWindow {
    visible: true
    width: 1100
    height: 700
    title: "Material Inspo"
    color: Material.MaterialPalette.background

    Rectangle {
        anchors.fill: parent
        color: Material.MaterialPalette.background
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 32
        spacing: 24

        Text {
            text: "Material-style UI in Qt Quick"
            font.pixelSize: 28
        color: Material.MaterialPalette.onSurface
            font.bold: true
        }

        RowLayout {
            spacing: 16
            Material.MaterialButton {
                text: "Primary action"
                onClicked: console.log("primary")
            }
            Material.MaterialButton {
                text: "Outlined action"
                outlined: true
                font.pixelSize: 14
                onClicked: console.log("outlined")
            }
        }

        RowLayout {
            spacing: 16
            Material.MaterialTextField {
                placeholderText: "Email address"
                width: parent.width / 3
            }
            Material.MaterialTextField {
                placeholderText: "Your role"
                width: parent.width / 4
            }
        }

        RowLayout {
            spacing: 12
            Material.MaterialChip { text: "Design" }
            Material.MaterialChip { text: "Data" }
            Material.MaterialChip { text: "Runtime" }
            Material.MaterialChip { text: "Automation" }
        }

        Material.MaterialDivider {
            width: parent.width
        }

        Material.MaterialSurface {
            Layout.fillWidth: true
            elevation: 14
            contentComponent: Component {
                ColumnLayout {
                    spacing: 14

                    Text {
                    text: "Material surface"
                    font.pixelSize: 20
                    color: Material.MaterialPalette.onSurface
                    font.bold: true
                }

                Text {
                    text: "Use surfaces to group related controls, apply elevation, and keep spacing consistent with Material principles."
                    font.pixelSize: 15
                    color: Material.MaterialPalette.onSurface
                    wrapMode: Text.Wrap
                }

                RowLayout {
                    spacing: 12
                    Material.MaterialButton { text: "Continue" }
                    Material.MaterialButton { text: "Cancel" ; outlined: true }
                }
            }
        }

        Material.MaterialCard {
            Layout.fillWidth: true
            contentItem: ColumnLayout {
                spacing: 10
                Text {
                    text: "Card headline"
                    font.pixelSize: 20
                    color: Material.MaterialPalette.onSurface
                }
                Text {
                    text: "Cards can load any content, here we show simple stacked text with Material spacing."
                    font.pixelSize: 15
                    color: Material.MaterialPalette.onSurface
                    wrapMode: Text.Wrap
                }
            }
        }

        ColumnLayout {
            spacing: 10
            Text {
                text: "Badge samples"
                font.pixelSize: 18
                color: Material.MaterialPalette.onSurface
                font.bold: true
            }

            RowLayout {
                spacing: 10
                Material.MaterialBadge { text: "alpha"; accent: true }
                Material.MaterialBadge { text: "stable"; dense: true }
                Material.MaterialBadge { text: "live"; outlined: true }
            }
        }
    }
}

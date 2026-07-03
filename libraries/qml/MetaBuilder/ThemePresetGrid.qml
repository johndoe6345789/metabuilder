import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: presetGrid
    Layout.fillWidth: true

    property string selectedTheme: "dark"
    property int radiusMedium: 8
    property var themeDefinitions: []

    signal themeSelected(string name)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 20
        spacing: 16

        CText { variant: "h4"; text: "Theme Presets" }
        CText { variant: "caption"; text: "Select a base theme to start from" }

        GridLayout {
            Layout.fillWidth: true
            columns: 3
            rowSpacing: 12
            columnSpacing: 12

            Repeater {
                model: themeDefinitions

                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 90
                    radius: radiusMedium
                    color: modelData.surface
                    border.width: selectedTheme === modelData.name ? 2 : 1
                    border.color: selectedTheme === modelData.name
                        ? Theme.primary : Theme.border

                    MouseArea {
                        Layout.fillWidth: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: themeSelected(modelData.name)
                    }

                    ColumnLayout {
                        Layout.fillWidth: true
                        anchors.margins: 10
                        spacing: 8

                        // Mini color swatch row
                        RowLayout {
                            spacing: 4

                            Repeater {
                                model: [modelData.bg, modelData.primary,
                                    modelData.text, modelData.surface]

                                Rectangle {
                                    width: 16
                                    height: 16
                                    radius: 3
                                    color: modelData
                                    border.width: 1
                                    border.color: Qt.darker(modelData, 1.3)
                                }
                            }
                        }

                        Item { Layout.fillHeight: true }

                        Text {
                            text: themeDefinitions[index].label
                            font.pixelSize: 12
                            font.weight: selectedTheme ===
                                themeDefinitions[index].name
                                    ? Font.Bold : Font.Normal
                            color: themeDefinitions[index].text
                        }

                        // Selection indicator
                        Rectangle {
                            width: 8
                            height: 8
                            radius: 4
                            color: selectedTheme ===
                                themeDefinitions[index].name
                                    ? Theme.primary : "transparent"
                        }
                    }
                }
            }
        }
    }
}

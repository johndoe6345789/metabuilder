import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: spacingEditor
    Layout.fillWidth: true

    property int baseSpacing: 8

    signal baseSpacingEdited(int value)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 20
        spacing: 16

        CText { variant: "h4"; text: "Spacing" }
        CText { variant: "caption"; text: "Base spacing unit used as a
            multiplier across the layout system" }

        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            spacing: 16

            CTextField {
                Layout.preferredWidth: 120
                label: "Base Spacing (px)"
                placeholderText: "8"
                text: baseSpacing.toString()
                onTextChanged: {
                    var val = parseInt(text)
                    if (!isNaN(val) && val > 0 && val <= 32) {
                        spacingEditor.baseSpacingEdited(val)
                    }
                }
            }

            // Spacing preview
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4

                CText { variant: "caption"; text: "Preview: spacing scale" }

                RowLayout {
                    spacing: 8

                    Repeater {
                        model: [1, 2, 3, 4, 6]

                        ColumnLayout {
                            spacing: 4
                            Rectangle {
                                width: baseSpacing * modelData
                                height: baseSpacing * modelData
                                radius: 3
                                color: Theme.primary
                                opacity: 0.3 + (index * 0.15)
                            }
                            Text {
                                text: (baseSpacing * modelData) + "px"
                                font.pixelSize: 10
                                color: Theme.textSecondary
                                horizontalAlignment: Text.AlignHCenter
                            }
                        }
                    }
                }
            }
        }
    }
}

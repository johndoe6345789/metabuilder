import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: spacingRadiusRoot
    Layout.fillWidth: true
    spacing: 20

    property int baseSpacing: 8
    property int radiusSmall: 4
    property int radiusMedium: 8
    property int radiusLarge: 16

    signal baseSpacingEdited(int value)
    signal radiusSmallEdited(int value)
    signal radiusMediumEdited(int value)
    signal radiusLargeEdited(int value)

    // Spacing section
    CCard {
        Layout.fillWidth: true

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 20
            spacing: 16

            CText { variant: "h4"; text: "Spacing" }
            CText { variant: "caption"; text: "Base spacing unit used as a multiplier across the layout system" }

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
                            baseSpacingChanged(val)
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

    // Border Radius section
    CCard {
        Layout.fillWidth: true

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 20
            spacing: 16

            CText { variant: "h4"; text: "Border Radius" }
            CText { variant: "caption"; text: "Control corner rounding for small, medium, and large elements" }

            CDivider { Layout.fillWidth: true }

            RowLayout {
                Layout.fillWidth: true
                spacing: 16

                CTextField {
                    Layout.preferredWidth: 100
                    label: "Small (px)"
                    placeholderText: "4"
                    text: radiusSmall.toString()
                    onTextChanged: {
                        var val = parseInt(text)
                        if (!isNaN(val) && val >= 0) {
                            radiusSmallChanged(val)
                        }
                    }
                }

                CTextField {
                    Layout.preferredWidth: 100
                    label: "Medium (px)"
                    placeholderText: "8"
                    text: radiusMedium.toString()
                    onTextChanged: {
                        var val = parseInt(text)
                        if (!isNaN(val) && val >= 0) {
                            radiusMediumChanged(val)
                        }
                    }
                }

                CTextField {
                    Layout.preferredWidth: 100
                    label: "Large (px)"
                    placeholderText: "16"
                    text: radiusLarge.toString()
                    onTextChanged: {
                        var val = parseInt(text)
                        if (!isNaN(val) && val >= 0) {
                            radiusLargeChanged(val)
                        }
                    }
                }

                Item { Layout.fillWidth: true }

                // Radius preview
                RowLayout {
                    spacing: 16

                    Repeater {
                        model: [
                            { label: "Sm", r: radiusSmall },
                            { label: "Md", r: radiusMedium },
                            { label: "Lg", r: radiusLarge }
                        ]

                        ColumnLayout {
                            spacing: 4

                            Rectangle {
                                width: 48
                                height: 48
                                radius: modelData.r
                                color: "transparent"
                                border.width: 2
                                border.color: Theme.primary
                            }

                            Text {
                                text: modelData.label + " (" + modelData.r + "px)"
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

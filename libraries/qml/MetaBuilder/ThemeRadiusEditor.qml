import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: radiusEditor
    Layout.fillWidth: true
    property int radiusSmall: 4
    property int radiusMedium: 8
    property int radiusLarge: 16
    signal radiusSmallEdited(int value)
    signal radiusMediumEdited(int value)
    signal radiusLargeEdited(int value)

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 16

        CText { variant: "h4"; text: "Border Radius" }
        CText {
            variant: "caption"
            text: "Control corner rounding for"
                + " small, medium, and large"
                + " elements"
        }
        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true; spacing: 16
            CTextField {
                Layout.preferredWidth: 100; label: "Small (px)"
                placeholderText: "4"; text: radiusSmall.toString()
                onTextChanged: {
                    var val = parseInt(text)
                    if (!isNaN(val) && val >= 0)
                        radiusEditor
                            .radiusSmallEdited(val)
                }
            }
            CTextField {
                Layout.preferredWidth: 100
                label: "Medium (px)"
                placeholderText: "8"
                text: radiusMedium.toString()
                onTextChanged: {
                    var val = parseInt(text)
                    if (!isNaN(val) && val >= 0)
                        radiusEditor
                            .radiusMediumEdited(val)
                }
            }
            CTextField {
                Layout.preferredWidth: 100
                label: "Large (px)"
                placeholderText: "16"
                text: radiusLarge.toString()
                onTextChanged: {
                    var val = parseInt(text)
                    if (!isNaN(val) && val >= 0)
                        radiusEditor
                            .radiusLargeEdited(val)
                }
            }
            Item { Layout.fillWidth: true }
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
                            width: 48; height: 48; radius: modelData.r
                            color: "transparent"
                            border.width: 2
                            border.color: Theme.primary
                        }
                        Text {
                            text: modelData.label
                                + " (" + modelData.r
                                + "px)"
                            font.pixelSize: 10
                            color: Theme.textSecondary
                            horizontalAlignment:
                                Text.AlignHCenter
                        }
                    }
                }
            }
        }
    }
}

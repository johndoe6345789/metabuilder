import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: typographyCard
    Layout.fillWidth: true

    property string fontFamily: "Inter"
    property int baseFontSize: 14

    signal fontFamilyEdited(string family)
    signal baseFontSizeEdited(int size)

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 20
        spacing: 16

        CText { variant: "h4"; text: "Typography" }
        CText {
            variant: "caption"
            text: "Configure font family and base"
                + " size for the entire interface"
        }

        CDivider { Layout.fillWidth: true }

        RowLayout {
            Layout.fillWidth: true
            spacing: 16

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 8

                CTextField {
                    Layout.fillWidth: true
                    label: "Font Family"
                    placeholderText:
                        "e.g., Inter, Roboto, system-ui"
                    text: fontFamily
                    onTextChanged: fontFamilyEdited(text)
                }
            }

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 8

                CText {
                    variant: "body2"
                    text: "Base Font Size: "
                        + baseFontSize + "px"
                }

                Slider {
                    Layout.fillWidth: true
                    from: 10
                    to: 24
                    stepSize: 1
                    value: baseFontSize
                    onValueChanged: {
                        baseFontSizeEdited(value)
                    }

                    background: Rectangle {
                        x: parent.leftPadding
                        y: parent.topPadding
                            + parent.availableHeight / 2
                            - height / 2
                        width: parent.availableWidth
                        height: 4
                        radius: 2
                        color: Theme.border

                        Rectangle {
                            width: parent.parent
                                .visualPosition
                                * parent.width
                            height: parent.height
                            radius: 2
                            color: Theme.primary
                        }
                    }

                    handle: Rectangle {
                        x: parent.leftPadding
                            + parent.visualPosition
                            * (parent.availableWidth
                                - width)
                        y: parent.topPadding
                            + parent.availableHeight / 2
                            - height / 2
                        width: 18
                        height: 18
                        radius: 9
                        color: Theme.primary
                        border.width: 2
                        border.color: Theme.background
                    }
                }

                RowLayout {
                    spacing: 4
                    CText { variant: "caption"; text: "10px" }
                    Item { Layout.fillWidth: true }
                    CText { variant: "caption"; text: "24px" }
                }
            }
        }
    }
}

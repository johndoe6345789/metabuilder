import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: livePreview
    Layout.fillWidth: true

    property string customPrimary: "#000000"
    property string customBackground: "#000000"
    property string customSurface: "#000000"
    property string customPaper: "#000000"
    property string customText: "#000000"
    property string customTextSecondary: "#000000"
    property string customBorder: "#000000"
    property string customError: "#000000"
    property string customWarning: "#000000"
    property string customSuccess: "#000000"
    property string customInfo: "#000000"
    property string fontFamily: "Inter"
    property int baseFontSize: 14
    property int radiusSmall: 4
    property int radiusMedium: 8

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h4"; text: "Live Preview" }
            Item { Layout.fillWidth: true }
            CBadge { text: "Interactive" }
        }

        CText { variant: "caption"; text: "A sample UI rendered with your current theme configuration" }

        CDivider { Layout.fillWidth: true }

        // Preview container
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 340
            radius: radiusMedium
            color: customBackground
            border.width: 1
            border.color: customBorder

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 20
                spacing: 14

                // Preview header bar
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 44
                    radius: radiusSmall
                    color: customSurface

                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 14
                        anchors.rightMargin: 14
                        spacing: 12

                        Text {
                            text: "MetaBuilder"
                            font.pixelSize: baseFontSize + 2
                            font.weight: Font.Bold
                            font.family: fontFamily
                            color: customText
                        }

                        Item { Layout.fillWidth: true }

                        Repeater {
                            model: ["Dashboard", "Settings", "Help"]
                            Text {
                                text: modelData
                                font.pixelSize: baseFontSize - 1
                                font.family: fontFamily
                                color: customTextSecondary
                            }
                        }
                    }
                }

                // Preview content area
                RowLayout {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    spacing: 12

                    // Preview card 1 - Status
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        radius: radiusMedium
                        color: customPaper
                        border.width: 1
                        border.color: customBorder

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 14
                            spacing: 8

                            Text {
                                text: "Status"
                                font.pixelSize: baseFontSize
                                font.weight: Font.Bold
                                font.family: fontFamily
                                color: customText
                            }

                            Rectangle {
                                Layout.fillWidth: true
                                height: 1
                                color: customBorder
                            }

                            Repeater {
                                model: [
                                    { label: "DBAL",     col: customSuccess },
                                    { label: "Auth",     col: customSuccess },
                                    { label: "Storage",  col: customWarning }
                                ]

                                RowLayout {
                                    spacing: 8
                                    Rectangle {
                                        width: 8; height: 8; radius: 4
                                        color: modelData.col
                                    }
                                    Text {
                                        text: modelData.label
                                        font.pixelSize: baseFontSize - 2
                                        font.family: fontFamily
                                        color: customTextSecondary
                                    }
                                }
                            }

                            Item { Layout.fillHeight: true }

                            Rectangle {
                                Layout.fillWidth: true
                                height: 30
                                radius: radiusSmall
                                color: customPrimary

                                Text {
                                    anchors.centerIn: parent
                                    text: "View Details"
                                    font.pixelSize: baseFontSize - 2
                                    font.family: fontFamily
                                    color: "#ffffff"
                                }
                            }
                        }
                    }

                    // Preview card 2 - Activity
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        radius: radiusMedium
                        color: customPaper
                        border.width: 1
                        border.color: customBorder

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 14
                            spacing: 8

                            Text {
                                text: "Activity"
                                font.pixelSize: baseFontSize
                                font.weight: Font.Bold
                                font.family: fontFamily
                                color: customText
                            }

                            Rectangle {
                                Layout.fillWidth: true
                                height: 1
                                color: customBorder
                            }

                            Repeater {
                                model: [
                                    { msg: "User signed in", t: "2m ago" },
                                    { msg: "Package installed", t: "5m ago" },
                                    { msg: "Schema updated", t: "1h ago" }
                                ]

                                ColumnLayout {
                                    spacing: 2
                                    Text {
                                        text: modelData.msg
                                        font.pixelSize: baseFontSize - 2
                                        font.family: fontFamily
                                        color: customText
                                    }
                                    Text {
                                        text: modelData.t
                                        font.pixelSize: baseFontSize - 4
                                        font.family: fontFamily
                                        color: customTextSecondary
                                    }
                                }
                            }

                            Item { Layout.fillHeight: true }

                            Rectangle {
                                Layout.fillWidth: true
                                height: 24
                                radius: radiusSmall
                                color: Qt.alpha(customError, 0.15)

                                Text {
                                    anchors.centerIn: parent
                                    text: "1 alert"
                                    font.pixelSize: baseFontSize - 4
                                    font.family: fontFamily
                                    color: customError
                                }
                            }

                            Rectangle {
                                Layout.fillWidth: true
                                height: 24
                                radius: radiusSmall
                                color: Qt.alpha(customInfo, 0.15)

                                Text {
                                    anchors.centerIn: parent
                                    text: "3 notifications"
                                    font.pixelSize: baseFontSize - 4
                                    font.family: fontFamily
                                    color: customInfo
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

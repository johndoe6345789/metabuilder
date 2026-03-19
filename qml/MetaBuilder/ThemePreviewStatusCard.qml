import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root

    property string customPaper: "#000000"
    property string customText: "#000000"
    property string customTextSecondary: "#000000"
    property string customBorder: "#000000"
    property string customPrimary: "#000000"
    property string customSuccess: "#000000"
    property string customWarning: "#000000"
    property string fontFamily: "Inter"
    property int baseFontSize: 14
    property int radiusSmall: 4
    property int radiusMedium: 8

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

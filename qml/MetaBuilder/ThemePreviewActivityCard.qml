import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: root
    property string customPaper: "#000000"
    property string customText: "#000000"
    property string customTextSecondary: "#000000"
    property string customBorder: "#000000"
    property string customError: "#000000"
    property string customInfo: "#000000"
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
            text: "Activity"
            font.pixelSize: baseFontSize; font.weight: Font.Bold
            font.family: fontFamily; color: customText
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: customBorder }

        Repeater {
            model: [
                { msg: "User signed in", t: "2m ago" },
                { msg: "Package installed", t: "5m ago" },
                { msg: "Schema updated", t: "1h ago" }
            ]
            ColumnLayout {
                spacing: 2
                Text {
                    text: modelData.msg; font.pixelSize: baseFontSize - 2
                    font.family: fontFamily; color: customText
                }
                Text {
                    text: modelData.t; font.pixelSize: baseFontSize - 4
                    font.family: fontFamily; color: customTextSecondary
                }
            }
        }

        Item { Layout.fillHeight: true }

        Rectangle {
            Layout.fillWidth: true; height: 24; radius: radiusSmall
            color: Qt.alpha(customError, 0.15)
            Text {
                anchors.centerIn: parent; text: "1 alert"
                font.pixelSize: baseFontSize - 4; font.family: fontFamily
                color: customError
            }
        }

        Rectangle {
            Layout.fillWidth: true; height: 24; radius: radiusSmall
            color: Qt.alpha(customInfo, 0.15)
            Text {
                anchors.centerIn: parent; text: "3 notifications"
                font.pixelSize: baseFontSize - 4; font.family: fontFamily
                color: customInfo
            }
        }
    }
}

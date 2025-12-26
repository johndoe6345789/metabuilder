import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: alert
    property alias title: titleText.text
    property alias message: messageText.text
    property string severity: "info"
    property bool dismissible: false
    signal dismissed()
    radius: 12
    color: severity === "success" ? MaterialPalette.primaryContainer :
           severity === "error" ? MaterialPalette.error :
           severity === "warning" ? MaterialPalette.secondaryContainer :
           MaterialPalette.surfaceVariant
    border.color: MaterialPalette.outline
    border.width: 1
    padding: 18
    implicitHeight: content.implicitHeight + 12

    RowLayout {
        id: content
        anchors.fill: parent
        spacing: 12

        Rectangle {
            width: 28
            height: 28
            radius: 14
            color: severity === "success" ? MaterialPalette.primary :
                   severity === "error" ? MaterialPalette.error :
                   severity === "warning" ? MaterialPalette.secondary : MaterialPalette.primary
            Text {
                anchors.centerIn: parent
                text: severity === "success" ? "✓" : severity === "error" ? "!" : severity === "warning" ? "!" : "ℹ"
                color: "#fff"
                font.pixelSize: 16
                font.bold: true
            }
        }

        ColumnLayout {
            spacing: 4
            Text {
                id: titleText
                font.pixelSize: 16
                font.bold: true
                color: MaterialPalette.onSurface
            }
            Text {
                id: messageText
                font.pixelSize: 14
                color: MaterialPalette.onSurface
                wrapMode: Text.Wrap
            }
        }

        Item {
            Layout.fillWidth: true
        }

        Button {
            visible: dismissible
            text: "Close"
            font.pixelSize: 12
            background: Rectangle {
                color: "transparent"
            }
            onClicked: alert.dismissed()
        }
    }
}

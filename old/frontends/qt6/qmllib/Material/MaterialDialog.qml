import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Dialog {
    id: dialog
    modal: true
    focus: true
    property alias title: titleText.text
    property alias description: descriptionText.text
    signal actionTriggered(string id)

    contentItem: Rectangle {
        color: MaterialPalette.surface
        radius: 16
        border.color: MaterialPalette.outline
        border.width: 1
        width: 480

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 24
            spacing: 12
            default property alias actionItems: actionsRow.data

            RowLayout {
                spacing: 12
                Text {
                    id: titleText
                    font.pixelSize: 20
                    font.bold: true
                    color: MaterialPalette.onSurface
                }
                Item { Layout.fillWidth: true }
                Button {
                    text: "Close"
                    onClicked: dialog.close()
                    background: Rectangle {
                        color: "transparent"
                    }
                }
            }

            Text {
                id: descriptionText
                font.pixelSize: 14
                color: MaterialPalette.onSurface
                wrapMode: Text.WordWrap
            }

            Item {
                Layout.fillHeight: true
            }

            RowLayout {
                id: actionsRow
                spacing: 10
                Layout.alignment: Qt.AlignRight
            }
        }
    }
}

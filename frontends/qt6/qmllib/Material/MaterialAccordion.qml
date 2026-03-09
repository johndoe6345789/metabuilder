import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: accordion
    property string headerText: ""
    property string summaryText: ""
    property bool expanded: false
    signal toggled(bool expanded)

    width: parent ? parent.width : 360
    color: MaterialPalette.surface
    radius: 12
    border.color: MaterialPalette.outline
    border.width: 1
    Layout.fillWidth: true

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 8

        RowLayout {
            spacing: 10
            Text {
                text: headerText
                font.pixelSize: 16
                font.bold: true
                color: MaterialPalette.onSurface
            }
            Item { Layout.fillWidth: true }
            Button {
                text: accordion.expanded ? "−" : "+"
                font.pixelSize: 16
                width: 36
                height: 36
                background: Rectangle {
                    radius: 18
                    color: MaterialPalette.primaryContainer
                }
                onClicked: {
                    accordion.expanded = !accordion.expanded
                    accordion.toggled(accordion.expanded)
                }
            }
        }

        Text {
            text: summaryText
            font.pixelSize: 14
            color: MaterialPalette.onSurface
            wrapMode: Text.Wrap
        }

        Loader {
            id: contentLoader
            visible: accordion.expanded
            asynchronous: true
            Layout.fillWidth: true
            Layout.preferredHeight: accordion.expanded ? implicitHeight : 0
        }
    }

    default property alias content: contentLoader.sourceComponent
}
}

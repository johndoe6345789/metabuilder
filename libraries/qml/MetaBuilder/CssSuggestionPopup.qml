import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: popup

    property var suggestions: []
    property bool shown: false

    signal suggestionClicked(string value)

    visible: shown && suggestions.length > 0
    width: parent ? parent.width : 200
    height: Math.min(suggestCol.implicitHeight + 8, 180)
    z: 100
    color: Theme.paper
    border.color: Theme.border
    border.width: 1
    radius: 6
    clip: true

    Flickable {
        anchors.fill: parent
        anchors.margins: 4
        contentHeight: suggestCol.implicitHeight
        clip: true

        Column {
            id: suggestCol
            width: parent.width
            spacing: 2

            Repeater {
                model: popup.suggestions

                Rectangle {
                    width: suggestCol.width
                    height: 26
                    radius: 4
                    color: suggestMa.containsMouse
                        ? Theme.surface : "transparent"

                    CText {
                        anchors.verticalCenter: parent.verticalCenter
                        anchors.left: parent.left
                        anchors.leftMargin: 8
                        variant: "body2"
                        text: modelData
                    }

                    MouseArea {
                        id: suggestMa
                        anchors.fill: parent
                        hoverEnabled: true
                        onClicked: popup.suggestionClicked(modelData)
                    }
                }
            }
        }
    }
}

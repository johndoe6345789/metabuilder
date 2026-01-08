import QtQuick
import QtQuick.Controls

Popup {
    id: tip
    implicitWidth: contentItem.implicitWidth
    implicitHeight: contentItem.implicitHeight
    contentItem: Text { id: t; text: tip.text; color: "white"; wrapMode: Text.WordWrap }
    property string text: ""
    background: Rectangle { color: "black"; radius: 4 }
}

import QtQuick 2.15
import QtQuick.Controls 2.15

Popup {
    id: tip
    implicitWidth: contentItem.implicitWidth
    implicitHeight: contentItem.implicitHeight
    contentItem: Text { id: t; text: tip.text; color: "white"; wrapMode: Text.WordWrap }
    property string text: ""
    background: Rectangle { color: "black"; radius: 4 }
}

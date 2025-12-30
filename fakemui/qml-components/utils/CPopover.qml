import QtQuick
import QtQuick.Controls

Popup {
    id: pop
    property alias content: contentItem
    background: Rectangle { color: "white"; border.color: "#ccc"; radius: 6 }
}

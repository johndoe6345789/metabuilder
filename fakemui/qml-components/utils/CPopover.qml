import QtQuick 2.15
import QtQuick.Controls 2.15

Popup {
    id: pop
    property alias content: contentItem
    background: Rectangle { color: "white"; border.color: "#ccc"; radius: 6 }
}

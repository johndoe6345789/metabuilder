import QtQuick
import QtQuick.Controls

Menu {
    id: menuProps
    background: Rectangle {
        color: "transparent"
    }
    property alias currentAction: menuProps.activeAction
}

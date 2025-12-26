import QtQuick 2.15
import QtQuick.Controls 2.15

Menu {
    id: menuProps
    background: Rectangle {
        color: "transparent"
    }
    property alias currentAction: menuProps.activeAction
}

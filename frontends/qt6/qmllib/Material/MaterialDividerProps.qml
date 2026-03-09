import QtQuick 2.15

import "MaterialPalette.qml" as MaterialPalette

Item {
    id: dividerProps
    property real thickness: 1
    Rectangle {
        id: divider
        width: parent ? parent.width : 100
        height: thickness
        color: MaterialPalette.outline
    }
}

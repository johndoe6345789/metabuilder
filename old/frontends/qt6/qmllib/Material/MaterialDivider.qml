import QtQuick 2.15

import "MaterialPalette.qml" as MaterialPalette

Rectangle {
    id: divider
    height: 1
    width: parent ? parent.width : 100
    color: MaterialPalette.outline
    radius: 0.5
}

import QtQuick 2.15
import QtQuick.Layouts 1.15

import "MaterialPalette.qml" as MaterialPalette

RowLayout {
    id: toolbar
    spacing: 12
    anchors.verticalCenter: parent ? parent.verticalCenter : undefined
    default property alias content: toolbar.data
}

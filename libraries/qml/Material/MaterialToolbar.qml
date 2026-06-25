import QtQuick
import QtQuick.Layouts

import "MaterialPalette.qml" as MaterialPalette

RowLayout {
    id: toolbar
    spacing: 12
    anchors.verticalCenter: parent ? parent.verticalCenter : undefined
    default property alias content: toolbar.data
}

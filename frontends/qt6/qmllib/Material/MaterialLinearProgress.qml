import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

ProgressBar {
    id: progress
    from: 0
    to: 1
    value: 0
    implicitHeight: 6
    background: Rectangle {
        color: MaterialPalette.surfaceVariant
        radius: 3
    }
    contentItem: Rectangle {
        color: MaterialPalette.primary
        radius: 3
    }
}

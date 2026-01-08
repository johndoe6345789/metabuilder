import QtQuick 2.15
import QtQuick.Controls 2.15

import "MaterialPalette.qml" as MaterialPalette

BusyIndicator {
    id: indicator
    running: true
    width: 48
    height: 48
    anchors.centerIn: parent
    busyIndicatorStyle: BusyIndicatorStyle {
        indicator {
            color: MaterialPalette.primary
            width: 4
        }
    }
}

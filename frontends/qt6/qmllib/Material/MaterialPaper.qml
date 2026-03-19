import QtQuick
import QtQuick.Layouts

import "MaterialSurface.qml" as MaterialSurface

MaterialSurface {
    id: paper
    property Component body

    Layout.alignment: Qt.AlignTop

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12

        Loader {
            id: paperLoader
            anchors.fill: parent
            sourceComponent: body
        }
    }
}

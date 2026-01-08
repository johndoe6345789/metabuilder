import QtQuick 2.15
import QtQuick.Layouts 1.15

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

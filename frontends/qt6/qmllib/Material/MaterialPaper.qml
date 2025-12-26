import QtQuick 2.15
import "MaterialSurface.qml" as Surface

Surface.MaterialSurface {
    id: paper
    property alias content: paperLoader.sourceComponent

    Loader {
        id: paperLoader
        anchors.fill: parent
        anchors.margins: 12
        sourceComponent: content
    }
}

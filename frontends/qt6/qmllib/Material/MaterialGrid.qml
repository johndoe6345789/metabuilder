import QtQuick
import QtQuick.Layouts

GridLayout {
    id: grid
    property int columns: 2
    property real spacing: 12
    columnSpacing: spacing
    rowSpacing: spacing
    anchors.fill: parent
    default property alias content: data
}

import QtQuick 2.15
import QtQuick.Layouts 1.15

GridLayout {
    id: grid
    property int columns: 2
    property real spacing: 12
    columnSpacing: spacing
    rowSpacing: spacing
    anchors.fill: parent
    default property alias content: data
}

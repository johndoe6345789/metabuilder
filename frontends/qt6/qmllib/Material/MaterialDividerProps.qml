import QtQuick 2.15
import QtQuick.Layouts 1.15

import "MaterialDivider.qml" as MaterialDivider

Component {
    property Item divider: MaterialDivider
    MaterialDivider.Rectangle {
        id: divider
        width: parent ? parent.width : 100
    }
}

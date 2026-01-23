import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: timeline
    
    property string position: "right" // left, right, alternate
    property alias model: repeater.model
    property Component delegate: defaultDelegate
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: contentColumn.implicitHeight
    
    // Default delegate component
    Component {
        id: defaultDelegate
        CTimelineItem {
            oppositeText: modelData.oppositeText || ""
            contentText: modelData.contentText || ""
            dotColor: modelData.dotColor || "#bdbdbd"
            dotVariant: modelData.dotVariant || "filled"
            showConnector: index < repeater.count - 1
        }
    }
    
    ColumnLayout {
        id: contentColumn
        anchors.fill: parent
        spacing: 0
        
        Repeater {
            id: repeater
            delegate: timeline.delegate
        }
    }
}

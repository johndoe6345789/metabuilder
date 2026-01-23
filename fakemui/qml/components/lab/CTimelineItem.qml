import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: timelineItem
    
    property string oppositeText: ""
    property string contentText: ""
    property color dotColor: "#bdbdbd"
    property string dotVariant: "filled" // filled, outlined
    property bool showConnector: true
    property alias content: contentLoader.sourceComponent
    property alias oppositeContent: oppositeLoader.sourceComponent
    
    implicitWidth: parent ? parent.width : 400
    implicitHeight: Math.max(contentColumn.implicitHeight, 60)
    
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        // Opposite content (left side)
        Item {
            Layout.preferredWidth: parent.width * 0.35
            Layout.fillHeight: true
            
            Loader {
                id: oppositeLoader
                anchors.right: parent.right
                anchors.rightMargin: 16
                anchors.verticalCenter: parent.verticalCenter
                
                sourceComponent: oppositeText ? defaultOppositeComponent : null
            }
            
            Component {
                id: defaultOppositeComponent
                Text {
                    text: timelineItem.oppositeText
                    font.pixelSize: 14
                    color: "#9e9e9e"
                    horizontalAlignment: Text.AlignRight
                }
            }
        }
        
        // Separator (dot + connector)
        Item {
            Layout.preferredWidth: 40
            Layout.fillHeight: true
            
            // Timeline dot
            Rectangle {
                id: dot
                width: 12
                height: 12
                radius: 6
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.top: parent.top
                anchors.topMargin: 4
                color: timelineItem.dotVariant === "filled" ? timelineItem.dotColor : "transparent"
                border.width: timelineItem.dotVariant === "outlined" ? 2 : 0
                border.color: timelineItem.dotColor
            }
            
            // Connector line
            Rectangle {
                visible: timelineItem.showConnector
                width: 2
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.top: dot.bottom
                anchors.topMargin: 4
                anchors.bottom: parent.bottom
                color: "#bdbdbd"
            }
        }
        
        // Main content (right side)
        ColumnLayout {
            id: contentColumn
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 4
            
            Loader {
                id: contentLoader
                Layout.fillWidth: true
                
                sourceComponent: contentText ? defaultContentComponent : null
            }
            
            Component {
                id: defaultContentComponent
                Text {
                    text: timelineItem.contentText
                    font.pixelSize: 14
                    color: "#1a1a1a"
                    wrapMode: Text.WordWrap
                }
            }
            
            Item { Layout.fillHeight: true }
        }
    }
}

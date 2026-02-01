import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: tabBar
    
    property int currentIndex: 0
    property var tabs: [] // [{label: "Tab 1", icon: "🏠"}]
    
    implicitHeight: 48
    color: "transparent"
    
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        Repeater {
            model: tabBar.tabs
            
            Rectangle {
                Layout.fillHeight: true
                Layout.preferredWidth: tabText.implicitWidth + 32
                
                color: tabBar.currentIndex === index ? "#2d2d2d" : (tabMouse.containsMouse ? "#252525" : "transparent")
                
                Behavior on color { ColorAnimation { duration: 150 } }
                
                ColumnLayout {
                    anchors.centerIn: parent
                    spacing: 4
                    
                    RowLayout {
                        Layout.alignment: Qt.AlignHCenter
                        spacing: 6
                        
                        Text {
                            text: modelData.icon || ""
                            font.pixelSize: 14
                            visible: modelData.icon
                        }
                        
                        Text {
                            id: tabText
                            text: modelData.label || modelData
                            font.pixelSize: 13
                            font.weight: tabBar.currentIndex === index ? Font.DemiBold : Font.Normal
                            color: tabBar.currentIndex === index ? "#4dabf7" : "#888888"
                            
                            Behavior on color { ColorAnimation { duration: 150 } }
                        }
                    }
                }
                
                // Active indicator
                Rectangle {
                    anchors.bottom: parent.bottom
                    anchors.horizontalCenter: parent.horizontalCenter
                    width: parent.width - 16
                    height: 3
                    radius: 1.5
                    color: "#4dabf7"
                    visible: tabBar.currentIndex === index
                }
                
                MouseArea {
                    id: tabMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: tabBar.currentIndex = index
                }
            }
        }
        
        Item { Layout.fillWidth: true }
    }
    
    // Bottom border
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        height: 1
        color: "#2d2d2d"
    }
}

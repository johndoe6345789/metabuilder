import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: sidebar
    
    property string title: ""
    property int currentIndex: 0
    property var items: [] // [{icon: "🏠", label: "Home"}]
    property alias footer: footerLoader.sourceComponent
    
    signal itemClicked(int index)
    
    implicitWidth: 240
    color: "#161616"
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // Header
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 56
            color: "transparent"
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                
                Text {
                    text: "⚡"
                    font.pixelSize: 20
                }
                
                Text {
                    Layout.fillWidth: true
                    text: sidebar.title
                    font.pixelSize: 16
                    font.weight: Font.Bold
                    color: "#4dabf7"
                }
            }
        }
        
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#2d2d2d"
        }
        
        // Navigation items
        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.topMargin: 8
            clip: true
            spacing: 4
            model: sidebar.items
            
            delegate: Rectangle {
                width: ListView.view.width - 16
                x: 8
                height: 40
                radius: 8
                color: sidebar.currentIndex === index ? "#1a3a5c" : (itemMouse.containsMouse ? "#2d2d2d" : "transparent")
                
                Behavior on color { ColorAnimation { duration: 150 } }
                
                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 12
                    
                    Text {
                        text: modelData.icon || ""
                        font.pixelSize: 16
                        opacity: sidebar.currentIndex === index ? 1.0 : 0.7
                    }
                    
                    Text {
                        Layout.fillWidth: true
                        text: modelData.label || modelData
                        font.pixelSize: 14
                        font.weight: sidebar.currentIndex === index ? Font.Medium : Font.Normal
                        color: sidebar.currentIndex === index ? "#ffffff" : "#b0b0b0"
                    }
                }
                
                MouseArea {
                    id: itemMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        sidebar.currentIndex = index
                        sidebar.itemClicked(index)
                    }
                }
            }
        }
        
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#2d2d2d"
            visible: footerLoader.item
        }
        
        // Footer
        Loader {
            id: footerLoader
            Layout.fillWidth: true
            Layout.preferredHeight: item ? item.implicitHeight : 0
        }
    }
}

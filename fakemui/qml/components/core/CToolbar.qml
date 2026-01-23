import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: toolbar
    
    property string title: ""
    property alias leftContent: leftLoader.sourceComponent
    property alias rightContent: rightLoader.sourceComponent
    property bool elevated: true
    
    implicitHeight: 56
    color: "#1e1e1e"
    
    // Bottom border
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        height: 1
        color: "#2d2d2d"
    }
    
    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 12
        
        Loader {
            id: leftLoader
        }
        
        Text {
            Layout.fillWidth: true
            text: toolbar.title
            font.pixelSize: 18
            font.weight: Font.DemiBold
            color: "#ffffff"
            elide: Text.ElideRight
            visible: toolbar.title
        }
        
        Loader {
            id: rightLoader
        }
    }
}

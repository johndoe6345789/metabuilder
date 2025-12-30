import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: overlay
    
    property bool loading: false
    property string message: "Loading..."
    
    visible: loading
    color: "#E0121212"
    
    MouseArea {
        anchors.fill: parent
        // Block clicks
    }
    
    ColumnLayout {
        anchors.centerIn: parent
        spacing: 16
        
        BusyIndicator {
            Layout.alignment: Qt.AlignHCenter
            Layout.preferredWidth: 48
            Layout.preferredHeight: 48
            running: overlay.loading
        }
        
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: overlay.message
            font.pixelSize: 14
            color: "#ffffff"
        }
    }
    
    Behavior on opacity {
        NumberAnimation { duration: 200 }
    }
}

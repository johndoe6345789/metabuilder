import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: emptyState
    
    property string icon: "📭"
    property string title: "Nothing here"
    property string description: ""
    property string actionText: ""
    
    signal actionClicked()
    
    implicitWidth: 300
    implicitHeight: contentColumn.implicitHeight
    
    ColumnLayout {
        id: contentColumn
        anchors.centerIn: parent
        spacing: 16
        
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: emptyState.icon
            font.pixelSize: 48
            opacity: 0.5
        }
        
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: emptyState.title
            font.pixelSize: 16
            font.weight: Font.Medium
            color: "#888888"
        }
        
        Text {
            Layout.alignment: Qt.AlignHCenter
            Layout.maximumWidth: 240
            text: emptyState.description
            font.pixelSize: 13
            color: "#666666"
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
            visible: emptyState.description
        }
        
        CButton {
            Layout.alignment: Qt.AlignHCenter
            text: emptyState.actionText
            variant: "primary"
            visible: emptyState.actionText
            onClicked: emptyState.actionClicked()
        }
    }
}

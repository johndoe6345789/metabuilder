import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: listItem
    
    property string title: ""
    property string subtitle: ""
    property string caption: ""
    property string leadingIcon: ""
    property string trailingText: ""
    property string trailingIcon: ""
    property bool selected: false
    property bool showDivider: true
    property alias trailing: trailingLoader.sourceComponent
    
    signal clicked()
    signal trailingClicked()
    
    implicitHeight: Math.max(56, contentColumn.implicitHeight + 16)
    
    color: {
        if (selected) return "#1a3a5c"
        if (mouseArea.containsMouse) return "#2d2d2d"
        return "transparent"
    }
    
    Behavior on color { ColorAnimation { duration: 150 } }
    
    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: listItem.clicked()
    }
    
    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 12
        
        // Leading icon
        Rectangle {
            Layout.preferredWidth: 40
            Layout.preferredHeight: 40
            radius: 20
            color: "#2d2d2d"
            visible: listItem.leadingIcon
            
            Text {
                anchors.centerIn: parent
                text: listItem.leadingIcon
                font.pixelSize: 18
            }
        }
        
        // Content
        ColumnLayout {
            id: contentColumn
            Layout.fillWidth: true
            spacing: 2
            
            Text {
                Layout.fillWidth: true
                text: listItem.title
                font.pixelSize: 14
                font.weight: Font.Medium
                color: "#ffffff"
                elide: Text.ElideRight
            }
            
            Text {
                Layout.fillWidth: true
                text: listItem.subtitle
                font.pixelSize: 12
                color: "#888888"
                elide: Text.ElideRight
                visible: listItem.subtitle
            }
            
            Text {
                Layout.fillWidth: true
                text: listItem.caption
                font.pixelSize: 11
                color: "#666666"
                elide: Text.ElideRight
                visible: listItem.caption
            }
        }
        
        // Trailing
        Text {
            text: listItem.trailingText
            font.pixelSize: 12
            color: "#888888"
            visible: listItem.trailingText
        }
        
        Loader {
            id: trailingLoader
        }
        
        Text {
            text: listItem.trailingIcon
            font.pixelSize: 16
            color: trailingMouseArea.containsMouse ? "#ffffff" : "#888888"
            visible: listItem.trailingIcon
            
            MouseArea {
                id: trailingMouseArea
                anchors.fill: parent
                anchors.margins: -8
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    mouse.accepted = true
                    listItem.trailingClicked()
                }
            }
        }
    }
    
    // Divider
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.leftMargin: listItem.leadingIcon ? 68 : 16
        height: 1
        color: "#2d2d2d"
        visible: listItem.showDivider
    }
}

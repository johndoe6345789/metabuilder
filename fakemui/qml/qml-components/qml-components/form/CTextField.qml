import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

TextField {
    id: control
    
    property string label: ""
    property string helper: ""
    property string errorText: ""
    property bool hasError: errorText.length > 0
    property string prefixIcon: ""
    property string suffixIcon: ""
    property bool clearable: false
    
    signal suffixClicked()
    
    implicitHeight: 40
    leftPadding: prefixIcon ? 36 : 12
    rightPadding: (clearable && text.length > 0) || suffixIcon ? 36 : 12
    
    font.pixelSize: 14
    color: "#ffffff"
    placeholderTextColor: "#666666"
    selectionColor: "#4dabf7"
    selectedTextColor: "#ffffff"
    
    background: Rectangle {
        radius: 8
        color: "#1e1e1e"
        border.width: control.activeFocus ? 2 : 1
        border.color: {
            if (control.hasError) return "#f44336"
            if (control.activeFocus) return "#4dabf7"
            return "#3d3d3d"
        }
        
        Behavior on border.color { ColorAnimation { duration: 150 } }
        Behavior on border.width { NumberAnimation { duration: 150 } }
        
        // Prefix icon
        Text {
            anchors.left: parent.left
            anchors.leftMargin: 12
            anchors.verticalCenter: parent.verticalCenter
            text: control.prefixIcon
            font.pixelSize: 16
            color: "#888888"
            visible: control.prefixIcon
        }
        
        // Suffix/clear button
        Text {
            anchors.right: parent.right
            anchors.rightMargin: 12
            anchors.verticalCenter: parent.verticalCenter
            text: control.clearable && control.text.length > 0 ? "✕" : control.suffixIcon
            font.pixelSize: 14
            color: clearMouseArea.containsMouse ? "#ffffff" : "#888888"
            visible: (control.clearable && control.text.length > 0) || control.suffixIcon
            
            MouseArea {
                id: clearMouseArea
                anchors.fill: parent
                anchors.margins: -8
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    if (control.clearable && control.text.length > 0) {
                        control.text = ""
                    } else {
                        control.suffixClicked()
                    }
                }
            }
        }
    }
}

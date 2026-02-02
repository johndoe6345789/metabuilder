import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * CDialog.qml - Modal dialog (mirrors _dialog.scss)
 * Overlay dialog with header, content, and footer
 */
Popup {
    id: root
    
    property string title: ""
    property string size: "md"           // sm, md, lg, xl
    property bool showClose: true
    property alias contentItem: contentArea.data
    property alias footerItem: footerArea.data
    
    // Size mapping
    readonly property int _maxWidth: {
        switch (size) {
            case "sm": return 400
            case "lg": return 800
            case "xl": return 1000
            default: return 640
        }
    }
    
    modal: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    anchors.centerIn: parent
    
    width: Math.min(_maxWidth, parent.width - StyleVariables.spacingLg * 2)
    
    // Fade in animation
    enter: Transition {
        ParallelAnimation {
            NumberAnimation { property: "opacity"; from: 0; to: 1; duration: 150 }
            NumberAnimation { property: "y"; from: root.y - 20; to: root.y; duration: 200; easing.type: Easing.OutCubic }
        }
    }
    
    exit: Transition {
        NumberAnimation { property: "opacity"; from: 1; to: 0; duration: 100 }
    }
    
    // Overlay background
    Overlay.modal: Rectangle {
        color: Qt.rgba(0, 0, 0, 0.6)
        
        Behavior on opacity { NumberAnimation { duration: 150 } }
    }
    
    background: Rectangle {
        color: Theme.surface
        radius: StyleVariables.radiusLg
        
        layer.enabled: true
        layer.effect: Item {
            Rectangle {
                anchors.fill: parent
                anchors.margins: -10
                color: "transparent"
                
                Rectangle {
                    anchors.fill: parent
                    anchors.margins: 10
                    color: "#000000"
                    opacity: 0.3
                    radius: StyleVariables.radiusLg + 4
                }
            }
        }
    }
    
    contentItem: ColumnLayout {
        spacing: 0
        
        // Header
        RowLayout {
            Layout.fillWidth: true
            Layout.margins: StyleVariables.spacingMd
            Layout.bottomMargin: 0
            spacing: StyleVariables.spacingMd
            visible: root.title !== "" || root.showClose
            
            Text {
                Layout.fillWidth: true
                text: root.title
                color: Theme.onSurface
                font.pixelSize: StyleVariables.fontSizeLg
                font.weight: Font.DemiBold
                elide: Text.ElideRight
            }
            
            CIconButton {
                visible: root.showClose
                icon: "✕"
                size: "sm"
                onClicked: root.close()
            }
        }
        
        // Divider after header
        CDivider {
            Layout.fillWidth: true
            visible: root.title !== ""
        }
        
        // Content area
        Item {
            id: contentArea
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.margins: StyleVariables.spacingLg
            implicitHeight: childrenRect.height
        }
        
        // Footer (optional)
        Item {
            id: footerArea
            Layout.fillWidth: true
            Layout.margins: StyleVariables.spacingMd
            Layout.topMargin: 0
            implicitHeight: childrenRect.height
            visible: children.length > 0
        }
    }
}

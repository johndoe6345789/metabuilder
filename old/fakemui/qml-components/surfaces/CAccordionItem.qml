import QtQuick
import QtQuick.Layouts

/**
 * CAccordionItem.qml - Single accordion item
 * Used inside CAccordion
 */
Rectangle {
    id: root
    objectName: "CAccordionItem"
    
    // Public properties
    property string title: ""
    property string icon: ""
    property string subtitle: ""
    property bool expanded: false
    property bool disabled: false
    
    // Internal - set by parent accordion
    property int index: 0
    property var accordion: null
    
    // Content slot
    default property alias content: contentColumn.data
    
    // Size
    Layout.fillWidth: true
    implicitHeight: headerRect.height + (expanded ? contentLoader.height : 0)
    
    // Appearance
    color: "transparent"
    
    // Animation
    Behavior on implicitHeight {
        NumberAnimation { duration: StyleVariables.transitionNormal; easing.type: Easing.OutCubic }
    }
    
    // Header
    Rectangle {
        id: headerRect
        width: parent.width
        height: 48
        color: headerMouse.containsMouse && !root.disabled ? StyleMixins.hoverBg(Theme.mode === "dark") : "transparent"
        
        Behavior on color { ColorAnimation { duration: StyleVariables.transitionFast } }
        
        MouseArea {
            id: headerMouse
            anchors.fill: parent
            hoverEnabled: !root.disabled
            cursorShape: root.disabled ? Qt.ForbiddenCursor : Qt.PointingHandCursor
            
            onClicked: {
                if (!root.disabled) {
                    root.expanded = !root.expanded
                    if (root.accordion) {
                        root.accordion.setExpanded(root.index, root.expanded)
                    }
                }
            }
        }
        
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: StyleVariables.spacingMd
            anchors.rightMargin: StyleVariables.spacingMd
            spacing: StyleVariables.spacingSm
            
            // Icon
            Text {
                visible: root.icon
                text: root.icon
                font.pixelSize: StyleVariables.fontSizeLg
                color: root.disabled ? Theme.textDisabled : Theme.text
            }
            
            // Title and subtitle
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 2
                
                Text {
                    text: root.title
                    font.pixelSize: StyleVariables.fontSizeSm
                    font.weight: Font.Medium
                    color: root.disabled ? Theme.textDisabled : Theme.text
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
                
                Text {
                    visible: root.subtitle
                    text: root.subtitle
                    font.pixelSize: StyleVariables.fontSizeXs
                    color: Theme.textSecondary
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
            }
            
            // Expand indicator
            Text {
                text: "▼"
                font.pixelSize: 10
                color: root.disabled ? Theme.textDisabled : Theme.textSecondary
                rotation: root.expanded ? 180 : 0
                
                Behavior on rotation {
                    NumberAnimation { duration: StyleVariables.transitionNormal }
                }
            }
        }
        
        // Bottom border
        Rectangle {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: 1
            color: Theme.divider
        }
    }
    
    // Content
    Loader {
        id: contentLoader
        anchors.top: headerRect.bottom
        width: parent.width
        active: root.expanded
        visible: root.expanded
        
        sourceComponent: Rectangle {
            width: contentLoader.width
            height: contentColumn.implicitHeight + StyleVariables.spacingMd * 2
            color: Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.3)
            
            ColumnLayout {
                id: contentColumn
                anchors.fill: parent
                anchors.margins: StyleVariables.spacingMd
                spacing: StyleVariables.spacingSm
            }
            
            // Bottom border
            Rectangle {
                anchors.bottom: parent.bottom
                anchors.left: parent.left
                anchors.right: parent.right
                height: 1
                color: Theme.divider
            }
        }
    }
}

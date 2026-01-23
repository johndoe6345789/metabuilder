import QtQuick
import QtQuick.Layouts
import QtQuick.Effects

/**
 * CPanel.qml - Panel component (mirrors _panel.scss)
 * Floating panel with header, body, and footer sections
 * 
 * Usage:
 *   CPanel {
 *       title: "Queue Status"
 *       icon: "📋"
 *       collapsible: true
 *       
 *       // Content goes in body
 *       Text { text: "Panel content" }
 *   }
 */
Rectangle {
    id: root
    
    // Public properties
    property string title: ""
    property string icon: ""
    property string variant: "default"  // default, elevated
    property string position: "none"    // none, fixed-br, fixed-bl, fixed-tr, fixed-tl
    property bool collapsible: false
    property bool collapsed: false
    property string footer: ""
    
    // Content slot
    default property alias content: bodyContent.data
    
    // Signals
    signal headerClicked()
    
    // Size
    implicitWidth: 280
    implicitHeight: collapsed ? headerRect.height : (headerRect.height + bodyLoader.height + footerLoader.height)
    
    // Positioning
    anchors.right: position === "fixed-br" || position === "fixed-tr" ? parent.right : undefined
    anchors.left: position === "fixed-bl" || position === "fixed-tl" ? parent.left : undefined
    anchors.bottom: position === "fixed-br" || position === "fixed-bl" ? parent.bottom : undefined
    anchors.top: position === "fixed-tr" || position === "fixed-tl" ? parent.top : undefined
    anchors.margins: position !== "none" ? StyleVariables.spacingMd : 0
    
    // Appearance
    color: Theme.paper
    radius: StyleVariables.radiusMd
    
    // Shadow for elevated variant
    layer.enabled: variant === "elevated"
    layer.effect: MultiEffect {
        shadowEnabled: true
        shadowColor: "#40000000"
        shadowBlur: 0.4
        shadowVerticalOffset: 6
    }
    
    // Smooth collapse animation
    Behavior on implicitHeight {
        NumberAnimation { duration: StyleVariables.transitionNormal; easing.type: Easing.OutCubic }
    }
    
    // Layout
    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // Header
        Rectangle {
            id: headerRect
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            color: Qt.darker(Theme.primary, 1.2)
            radius: root.radius
            visible: root.title || root.icon
            
            // Square off bottom corners
            Rectangle {
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                height: parent.radius
                color: parent.color
                visible: !root.collapsed
            }
            
            MouseArea {
                anchors.fill: parent
                cursorShape: root.collapsible ? Qt.PointingHandCursor : Qt.ArrowCursor
                onClicked: {
                    if (root.collapsible) {
                        root.collapsed = !root.collapsed
                    }
                    root.headerClicked()
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
                    font.pixelSize: StyleVariables.fontSizeMd
                    color: "#ffffff"
                }
                
                // Title
                Text {
                    Layout.fillWidth: true
                    text: root.title
                    font.pixelSize: StyleVariables.fontSizeSm
                    font.weight: Font.Medium
                    color: "#ffffff"
                    elide: Text.ElideRight
                }
                
                // Collapse indicator
                Text {
                    visible: root.collapsible
                    text: root.collapsed ? "▼" : "▲"
                    font.pixelSize: 10
                    color: "#cccccc"
                }
            }
        }
        
        // Body
        Loader {
            id: bodyLoader
            Layout.fillWidth: true
            active: !root.collapsed
            visible: active
            
            sourceComponent: Rectangle {
                width: bodyLoader.width
                height: Math.min(bodyContent.implicitHeight, 300)
                color: "transparent"
                clip: true
                
                Flickable {
                    anchors.fill: parent
                    contentHeight: bodyContent.implicitHeight
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    
                    ColumnLayout {
                        id: bodyContent
                        width: parent.width
                        spacing: StyleVariables.spacingSm
                    }
                    
                    ScrollBar.vertical: ScrollBar {
                        policy: bodyContent.implicitHeight > 300 ? ScrollBar.AsNeeded : ScrollBar.AlwaysOff
                    }
                }
            }
        }
        
        // Footer
        Loader {
            id: footerLoader
            Layout.fillWidth: true
            active: root.footer && !root.collapsed
            visible: active
            
            sourceComponent: Rectangle {
                width: footerLoader.width
                height: 32
                color: "transparent"
                
                // Top border
                Rectangle {
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: 1
                    color: Theme.divider
                }
                
                Text {
                    anchors.centerIn: parent
                    text: root.footer
                    font.pixelSize: StyleVariables.fontSizeXs
                    color: Theme.textSecondary
                }
            }
        }
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Effects

/**
 * CCard.qml - Card container component (mirrors _card.scss)
 * Uses StyleVariables for consistent styling
 */
Rectangle {
    id: card
    
    property string title: ""
    property string subtitle: ""
    property bool elevated: false
    property bool hoverable: false
    property bool clickable: false
    property string variant: "default"  // default, outlined, elevated
    
    signal clicked()
    
    default property alias cardContent: contentColumn.data
    
    color: Theme.paper
    radius: StyleVariables.radiusMd
    border.width: 1
    border.color: {
        if (hoverable && mouseArea.containsMouse) return Theme.primary
        return variant === "outlined" ? Theme.border : Theme.border
    }
    
    implicitHeight: contentColumn.implicitHeight
    implicitWidth: 300
    
    Behavior on border.color { ColorAnimation { duration: StyleVariables.transitionFast } }
    Behavior on color { ColorAnimation { duration: StyleVariables.transitionFast } }
    
    // Hover effect for clickable cards
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        color: (card.hoverable || card.clickable) && mouseArea.containsMouse 
            ? StyleMixins.hoverBg(Theme.mode === "dark") 
            : "transparent"
        
        Behavior on color { ColorAnimation { duration: StyleVariables.transitionFast } }
    }
    
    layer.enabled: elevated || variant === "elevated"
    layer.effect: MultiEffect {
        shadowEnabled: true
        shadowColor: StyleVariables.shadowMd.color
        shadowBlur: StyleVariables.shadowMd.blur
        shadowVerticalOffset: StyleVariables.shadowMd.offset
    }
    
    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: card.hoverable || card.clickable
        cursorShape: card.clickable ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: if (card.clickable) card.clicked()
    }
    
    // Simple content column - children are placed here
    ColumnLayout {
        id: contentColumn
        anchors.fill: parent
        spacing: 0
    }
}

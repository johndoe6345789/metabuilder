import QtQuick
import QtQuick.Layouts

/**
 * CAccordion.qml - Accordion/expansion panel (mirrors _accordion.scss)
 * Expandable panels with header and content
 * 
 * Usage:
 *   CAccordion {
 *       CAccordionItem {
 *           title: "Section 1"
 *           Text { text: "Content 1" }
 *       }
 *       CAccordionItem {
 *           title: "Section 2"
 *           Text { text: "Content 2" }
 *       }
 *   }
 */
ColumnLayout {
    id: root
    
    // Public properties
    property bool exclusive: true  // Only one item expanded at a time
    property int expandedIndex: -1
    
    spacing: 0
    
    // Track children
    onChildrenChanged: {
        for (var i = 0; i < children.length; i++) {
            if (children[i].objectName === "CAccordionItem") {
                children[i].index = i
                children[i].accordion = root
            }
        }
    }
    
    function setExpanded(index, expanded) {
        if (exclusive && expanded) {
            // Collapse all others
            for (var i = 0; i < children.length; i++) {
                if (children[i].objectName === "CAccordionItem" && i !== index) {
                    children[i].expanded = false
                }
            }
        }
        expandedIndex = expanded ? index : -1
    }
}

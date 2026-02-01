import QtQuick
import QtQuick.Layouts

/**
 * CSection.qml - Content section (mirrors _section.scss)
 * Groups related content with optional title
 */
ColumnLayout {
    id: root
    
    property string title: ""
    property string subtitle: ""
    property bool divider: false
    property string spacing: "md"        // sm, md, lg
    
    default property alias content: contentItem.data
    
    spacing: {
        switch (root.spacing) {
            case "sm": return StyleVariables.spacingSm
            case "lg": return StyleVariables.spacingLg
            default: return StyleVariables.spacingMd
        }
    }
    
    // Header
    ColumnLayout {
        Layout.fillWidth: true
        spacing: StyleVariables.spacingXs
        visible: root.title !== "" || root.subtitle !== ""
        
        Text {
            Layout.fillWidth: true
            text: root.title
            color: Theme.onSurface
            font.pixelSize: StyleVariables.fontSizeLg
            font.weight: Font.DemiBold
            visible: root.title !== ""
        }
        
        Text {
            Layout.fillWidth: true
            text: root.subtitle
            color: Theme.onSurfaceVariant
            font.pixelSize: StyleVariables.fontSizeSm
            wrapMode: Text.Wrap
            visible: root.subtitle !== ""
        }
    }
    
    // Divider after header
    CDivider {
        Layout.fillWidth: true
        visible: root.divider && root.title !== ""
    }
    
    // Content
    Item {
        id: contentItem
        Layout.fillWidth: true
        implicitHeight: childrenRect.height
    }
}

import QtQuick
import QtQuick.Layouts

/**
 * CFormGroup.qml - Form field container (mirrors _form.scss)
 * Groups label, input, and helper/error text
 */
ColumnLayout {
    id: root
    
    property string label: ""
    property string helperText: ""
    property string errorText: ""
    property bool required: false
    property bool disabled: false
    
    default property alias content: contentArea.data
    
    spacing: StyleVariables.spacingXs
    
    // Label
    RowLayout {
        Layout.fillWidth: true
        spacing: 2
        visible: root.label !== ""
        
        Text {
            text: root.label
            color: root.disabled ? Theme.onSurfaceVariant : Theme.onSurface
            font.pixelSize: StyleVariables.fontSizeSm
            font.weight: Font.Medium
            opacity: root.disabled ? 0.6 : 1
        }
        
        Text {
            text: "*"
            color: Theme.error
            font.pixelSize: StyleVariables.fontSizeSm
            visible: root.required
        }
    }
    
    // Content slot (for input)
    Item {
        id: contentArea
        Layout.fillWidth: true
        implicitHeight: childrenRect.height
    }
    
    // Helper or error text
    Text {
        Layout.fillWidth: true
        text: root.errorText || root.helperText
        color: root.errorText ? Theme.error : Theme.onSurfaceVariant
        font.pixelSize: StyleVariables.fontSizeXs
        visible: text !== ""
        wrapMode: Text.Wrap
    }
}

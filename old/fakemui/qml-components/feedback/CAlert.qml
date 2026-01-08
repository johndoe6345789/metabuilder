import QtQuick
import QtQuick.Layouts

/**
 * CAlert.qml - Alert/notification component (mirrors _alert.scss)
 * Displays contextual feedback messages with severity levels
 * 
 * Usage:
 *   CAlert {
 *       severity: "error"
 *       text: "Something went wrong"
 *       closable: true
 *   }
 */
Rectangle {
    id: root
    
    // Public properties
    property string text: ""
    property string title: ""
    property string severity: "info"  // info, success, warning, error
    property string icon: ""          // Custom icon, auto-selected if empty
    property bool closable: false
    property string variant: "filled" // filled, outlined, standard
    
    // Signals
    signal closed()
    
    // Auto-select icon based on severity
    readonly property string _effectiveIcon: icon || {
        "info": "ℹ️",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌"
    }[severity] || "ℹ️"
    
    // Get colors based on severity
    readonly property color _bgColor: {
        if (variant === "outlined") return "transparent"
        if (variant === "standard") return Qt.rgba(_accentColor.r, _accentColor.g, _accentColor.b, 0.08)
        // filled
        return Qt.rgba(_accentColor.r, _accentColor.g, _accentColor.b, 0.15)
    }
    
    readonly property color _accentColor: StyleMixins.statusColor(severity)
    
    readonly property color _textColor: {
        if (variant === "filled") return _accentColor
        return Theme.text
    }
    
    // Size and appearance
    implicitHeight: contentLayout.implicitHeight + StyleVariables.spacingMd * 2
    implicitWidth: 300
    
    color: _bgColor
    radius: StyleVariables.radiusSm
    border.width: variant === "outlined" ? 1 : 0
    border.color: _accentColor
    
    // Content
    RowLayout {
        id: contentLayout
        anchors.fill: parent
        anchors.margins: StyleVariables.spacingMd
        spacing: StyleVariables.spacingSm
        
        // Icon
        Text {
            text: root._effectiveIcon
            font.pixelSize: StyleVariables.fontSizeLg
            Layout.alignment: Qt.AlignTop
        }
        
        // Text content
        ColumnLayout {
            Layout.fillWidth: true
            spacing: StyleVariables.spacingXs
            
            // Title (optional)
            Text {
                visible: root.title
                text: root.title
                font.pixelSize: StyleVariables.fontSizeSm
                font.weight: Font.Bold
                color: root._textColor
                Layout.fillWidth: true
                wrapMode: Text.WordWrap
            }
            
            // Message
            Text {
                text: root.text
                font.pixelSize: StyleVariables.fontSizeSm
                color: root._textColor
                opacity: root.title ? 0.9 : 1.0
                Layout.fillWidth: true
                wrapMode: Text.WordWrap
            }
        }
        
        // Close button
        Text {
            visible: root.closable
            text: "✕"
            font.pixelSize: StyleVariables.fontSizeSm
            color: Theme.textSecondary
            Layout.alignment: Qt.AlignTop
            
            MouseArea {
                anchors.fill: parent
                anchors.margins: -8
                cursorShape: Qt.PointingHandCursor
                onClicked: root.closed()
            }
        }
    }
    
    // Entry animation
    opacity: 0
    Component.onCompleted: opacity = 1
    Behavior on opacity { NumberAnimation { duration: StyleVariables.transitionNormal } }
}

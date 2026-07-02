import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CAlert.qml - Material Design 3 Alert component
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

    // Accessibility
    Accessible.role: Accessible.AlertMessage
    Accessible.name: title || text
    objectName: "alert_" + severity

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

    // MD3 severity color
    readonly property color _severityColor: {
        switch (severity) {
            case "success": return Theme.success
            case "error": return Theme.error
            case "warning": return Theme.warning
            case "info": return Theme.info
            default: return Theme.info
        }
    }

    // MD3 tonal background based on severity (12% opacity)
    readonly property color _bgColor: {
        if (variant === "outlined") return "transparent"
        if (variant === "standard") return (
            Qt.rgba(_severityColor.r, _severityColor.g,
                _severityColor.b, 0.08))
        // filled — MD3 tonal surface
        return Qt.rgba(_severityColor.r, _severityColor.g,
            _severityColor.b, 0.12)
    }

    readonly property color _accentColor: _severityColor

    readonly property color _textColor: {
        if (variant === "filled") return _severityColor
        return Theme.text
    }

    // Size and appearance
    implicitHeight: contentLayout.implicitHeight + 16 * 2
    implicitWidth: 300

    color: _bgColor
    radius: 12
    border.width: variant === "outlined" ? 1 : 0
    border.color: _accentColor

    // MD3 left accent bar
    Rectangle {
        id: accentBar
        width: 4
        height: parent.height - 8
        anchors.left: parent.left
        anchors.leftMargin: 4
        anchors.verticalCenter: parent.verticalCenter
        radius: 2
        color: root._severityColor
        visible: root.variant !== "outlined"
    }

    // Content
    RowLayout {
        id: contentLayout
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        anchors.topMargin: 16
        anchors.bottomMargin: 16
        spacing: 12

        // Icon
        Text {
            text: root._effectiveIcon
            font.pixelSize: 20
            Layout.alignment: Qt.AlignTop
        }

        // Text content
        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            // Title (optional)
            Text {
                visible: root.title !== ""
                text: root.title
                font.pixelSize: 13
                font.weight: Font.DemiBold
                color: root._severityColor
                Layout.fillWidth: true
                wrapMode: Text.WordWrap
            }

            // Message
            Text {
                text: root.text
                font.pixelSize: 14
                color: root.title ? Theme.text : root._textColor
                opacity: root.title ? 0.9 : 1.0
                Layout.fillWidth: true
                wrapMode: Text.WordWrap
                lineHeight: 1.4
            }
        }

        // Close button
        Rectangle {
            visible: root.closable
            width: 28
            height: 28
            radius: 14
            color: closeArea.containsMouse ? Qt.rgba(root._severityColor.r,
                root._severityColor.g, root._severityColor.b,
                    0.12) : "transparent"
            Layout.alignment: Qt.AlignTop

            Text {
                anchors.centerIn: parent
                text: "✕"
                font.pixelSize: 14
                color: Theme.textSecondary
            }

            MouseArea {
                id: closeArea
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                hoverEnabled: true
                onClicked: root.closed()
            }
        }
    }

    // Entry animation
    opacity: 0
    Component.onCompleted: opacity = 1
    Behavior on opacity { NumberAnimation { duration: 200
    easing.type: Easing.OutCubic } }
}

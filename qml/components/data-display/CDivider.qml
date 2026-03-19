import QtQuick
import QmlComponents 1.0

/**
 * CDivider.qml - Material Design 3 divider
 * Thin line separator, horizontal or vertical
 *
 * Usage:
 *   CDivider {}                                       // Full-width horizontal
 *   CDivider { variant: "inset" }                     // 16px left inset
 *   CDivider { orientation: "vertical" }              // Vertical divider
 *   CDivider { text: "OR" }                           // Divider with centered
 // text
 */
Item {
    id: root

    // Public properties
    property string orientation: "horizontal"  // horizontal, vertical
    property string text: ""
    property string variant: "fullWidth"       // fullWidth, inset, middle
    property int inset: 16

    // MD3: 1px line using outlineVariant (softer than border)
    readonly property color _lineColor: Theme.border

    Accessible.role: Accessible.Separator

    // Size
    implicitWidth: orientation === "horizontal" ? 200 : 1
    implicitHeight: orientation === "horizontal"
        ? (text ? 24 : 1) : 200

    // Horizontal divider
    Row {
        visible: root.orientation === "horizontal"
        anchors.fill: parent
        anchors.leftMargin: root.variant === "inset"
            ? root.inset : (root.variant === "middle" ? root.inset : 0)
        anchors.rightMargin: root.variant === "middle" ? root.inset : 0
        spacing: root.text ? StyleVariables.spacingMd : 0

        // Left line
        Rectangle {
            width: root.text ? (parent.width - textLabel.width -
                StyleVariables.spacingMd * 2) / 2 : parent.width
            height: 1
            anchors.verticalCenter: parent.verticalCenter
            color: root._lineColor
        }

        // Text label
        Text {
            id: textLabel
            visible: root.text !== ""
            text: root.text
            font.pixelSize: StyleVariables.fontSizeXs
            font.weight: Font.Medium
            font.family: Theme.fontFamily
            color: Theme.textSecondary
            anchors.verticalCenter: parent.verticalCenter
        }

        // Right line
        Rectangle {
            visible: root.text !== ""
            width: (parent.width - textLabel.width - StyleVariables.spacingMd *
                2) / 2
            height: 1
            anchors.verticalCenter: parent.verticalCenter
            color: root._lineColor
        }
    }

    // Vertical divider
    Rectangle {
        visible: root.orientation === "vertical"
        width: 1
        height: parent.height
        anchors.horizontalCenter: parent.horizontalCenter
        color: root._lineColor
    }
}

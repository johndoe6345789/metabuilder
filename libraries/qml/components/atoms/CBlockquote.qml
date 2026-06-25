import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CBlockquote.qml - Material Design 3 blockquote
 * Styled quote block with primary left border and tonal background
 */
Rectangle {
    id: root

    property string text: ""
    property string cite: ""

    // MD3 tonal primary background
    color: Qt.rgba(Theme.primary.r, Theme.primary.g, Theme.primary.b, 0.04)

    // MD3 rounded right side, squared left (border covers left rounding)
    radius: 8

    implicitWidth: parent ? parent.width : 400
    implicitHeight: contentCol.implicitHeight + 32

    // Left accent border - 4px primary with radius 2
    Rectangle {
        id: leftBorder
        width: 4
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        color: Theme.primary
        radius: 2
    }

    ColumnLayout {
        id: contentCol
        anchors.left: leftBorder.right
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        anchors.topMargin: 16
        anchors.bottomMargin: 16
        spacing: 8

        Text {
            Layout.fillWidth: true
            text: root.text
            color: Theme.text
            font.pixelSize: 16
            font.italic: true
            font.letterSpacing: 0.5
            wrapMode: Text.Wrap
            lineHeight: 1.6
            lineHeightMode: Text.ProportionalHeight
        }

        Text {
            Layout.fillWidth: true
            text: "— " + root.cite
            color: Theme.textSecondary
            font.pixelSize: 14
            font.letterSpacing: 0.25
            visible: root.cite !== ""
        }
    }
}

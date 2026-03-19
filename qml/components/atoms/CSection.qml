import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CSection.qml - Material Design 3 content section
 * Groups related content with optional title and subtitle
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
            case "sm": return 8
            case "lg": return 24
            default: return 16
        }
    }

    // Header
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        visible: root.title !== "" || root.subtitle !== ""

        Text {
            Layout.fillWidth: true
            text: root.title
            color: Theme.text
            font.pixelSize: 22
            font.weight: Font.Bold
            font.letterSpacing: 0
            lineHeight: 1.27
            lineHeightMode: Text.ProportionalHeight
            visible: root.title !== ""
        }

        Text {
            Layout.fillWidth: true
            text: root.subtitle
            color: Theme.textSecondary
            font.pixelSize: 14
            font.letterSpacing: 0.25
            lineHeight: 1.43
            lineHeightMode: Text.ProportionalHeight
            wrapMode: Text.Wrap
            visible: root.subtitle !== ""
        }
    }

    // Bottom divider after header
    Rectangle {
        Layout.fillWidth: true
        height: 1
        color: Theme.mode === "dark"
            ? Qt.rgba(1, 1, 1, 0.12) : Qt.rgba(0, 0, 0, 0.12)
        visible: root.divider && root.title !== ""
    }

    // Content
    Item {
        id: contentItem
        Layout.fillWidth: true
        implicitHeight: childrenRect.height
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "card_level_ref_" + levelNumber
    Accessible.role: Accessible.Grouping
    Accessible.name: levelName + ", Level "
        + levelNumber + ", " + role

    property string levelName: ""
    property string role: ""
    property string description: ""
    property color accent: "#6366F1"
    property int levelNumber: 1
    property bool isDark: false

    // MD3 tonal surfaces
    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary

    implicitHeight: lvlCardCol.implicitHeight + 32
    radius: 16
    clip: true
    color: surfaceContainerHigh
    border.width: 1
    border.color: outlineVariant

    // Colored accent bar on the left
    Rectangle {
        anchors.left: parent.left
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        width: 4
        color: root.accent
    }

    ColumnLayout {
        id: lvlCardCol
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.leftMargin: 20
        anchors.rightMargin: 20
        anchors.topMargin: 16
        spacing: 8

        RowLayout {
            Layout.fillWidth: true
            spacing: 10

            // Level number badge
            Rectangle {
                width: 28
                height: 28
                radius: 8
                color: Qt.rgba(root.accent.r, root.accent.g, root.accent.b,
                    root.isDark ? 0.2 : 0.15)

                CText {
                    anchors.centerIn: parent
                    text: root.levelNumber.toString()
                    font.pixelSize: 12
                    font.weight: Font.Bold
                    color: root.accent
                }
            }

            CText {
                text: root.levelName
                font.pixelSize: 15
                font.weight: Font.DemiBold
                color: root.onSurface
            }

            Item { Layout.fillWidth: true }

            CChip {
                text: root.role
                chipColor: root.accent
                variant: "filter"
                selected: true
                Accessible.role: Accessible.StaticText
                Accessible.name: root.role
            }
        }

        CText {
            text: root.description
            font.pixelSize: 13
            wrapMode: Text.Wrap
            Layout.fillWidth: true
            color: root.onSurfaceVariant
            lineHeight: 1.4
        }
    }
}

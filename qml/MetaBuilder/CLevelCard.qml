import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root
    objectName: "card_level_" + level
    Accessible.role: Accessible.Button
    Accessible.name: name + " Level " + level
    activeFocusOnTab: true
    Keys.onReturnPressed: root.clicked()
    Keys.onSpacePressed: root.clicked()

    property int level: 1
    property string name: ""
    property color accent: "#94A3B8"
    property string desc: ""
    property var tags: []
    property bool locked: false
    property bool isDark: false

    signal clicked()

    // MD3 tonal surfaces
    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color surfaceContainerHighest: isDark
        ? Qt.rgba(1, 1, 1, 0.12) : Qt.rgba(0.31, 0.31, 0.44, 0.14)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    radius: 16
    clip: true
    color: lvlMA.containsMouse ? surfaceContainerHighest : surfaceContainerHigh
    border.color: lvlMA.containsMouse ? accent : outlineVariant
    border.width: 1

    Behavior on color { ColorAnimation { duration: 200 } }
    Behavior on border.color { ColorAnimation { duration: 200 } }

    MouseArea {
        id: lvlMA
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 6

        RowLayout {
            spacing: 10

            Rectangle {
                width: 28; height: 28; radius: 8
                color: Qt.rgba(accent.r, accent.g, accent.b, isDark
                    ? 0.2 : 0.15)

                CText {
                    anchors.centerIn: parent
                    text: root.level.toString()
                    font.pixelSize: 12
                    font.weight: Font.Bold
                    color: accent
                }
            }

            CText {
                text: root.name
                font.pixelSize: 16
                font.weight: Font.DemiBold
                color: onSurface
            }

            Item { Layout.fillWidth: true }

            CText {
                visible: root.locked
                text: "\uD83D\uDD12"
                font.pixelSize: 14
                opacity: isDark ? 0.3 : 0.4
            }
        }

        CText {
            text: root.desc
            font.pixelSize: 13
            wrapMode: Text.Wrap
            Layout.fillWidth: true
            color: onSurfaceVariant
            lineHeight: 1.4
        }

        Item { Layout.fillHeight: true }

        CLevelTagFlow {
            tags: root.tags
            accent: root.accent
            isDark: root.isDark
        }
    }
}

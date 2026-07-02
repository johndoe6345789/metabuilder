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

    property int    level:  1
    property string name:   ""
    property color  accent: "#3b82f6"
    property string desc:   ""
    property var    tags:   []
    property bool   locked: false
    property bool   isDark: false

    // Per-level gradient stops matching docs/old reference
    readonly property var levelGradients: [
        { from: "#3b82f6", to: "#2563eb" },  // L1 blue
        { from: "#22c55e", to: "#16a34a" },  // L2 green
        { from: "#f97316", to: "#ea580c" },  // L3 orange
        { from: "#a855f7", to: "#9333ea" },  // L4 purple
        { from: "#f59e0b", to: "#d97706" },  // L5 amber
    ]
    readonly property var grad: levelGradients[Math.max(0,
        Math.min(level - 1, levelGradients.length - 1))]

    signal clicked()

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.07) : Qt.rgba(0.98, 0.98, 1.0, 1.0)
    readonly property color surfaceContainerHighest: isDark
        ? Qt.rgba(1, 1, 1, 0.11) : Qt.rgba(0.95, 0.95, 1.0, 1.0)
    // Level-5 amber tint
    readonly property color surfaceAmber: isDark
        ? Qt.rgba(0.95, 0.63, 0.05, 0.12)
        : Qt.rgba(0.99, 0.97, 0.88, 1.0)
    readonly property color borderDefault: isDark
        ? Qt.rgba(1, 1, 1, 0.10) : Qt.rgba(0.0, 0.0, 0.0, 0.10)
    readonly property color borderHover:  Qt.color(grad.from)
    readonly property color borderAmber:  "#d97706"

    radius: 16
    clip: true
    implicitHeight: cardLayout.implicitHeight + 32
    color: {
        if (level === 5)   return lvlMA.containsMouse ? surfaceAmber : surfaceAmber
        return lvlMA.containsMouse ? surfaceContainerHighest : surfaceContainerHigh
    }
    border.color: {
        if (level === 5 && !locked) return borderAmber
        return lvlMA.containsMouse && !locked ? borderHover : borderDefault
    }
    border.width: 2
    opacity: locked ? 0.45 : 1.0

    Behavior on color        { ColorAnimation { duration: 180 } }
    Behavior on border.color { ColorAnimation { duration: 180 } }

    // Subtle lift on hover (unlocked)
    layer.enabled: !locked && lvlMA.containsMouse
    layer.effect: null

    transform: Translate {
        y: (!locked && lvlMA.containsMouse) ? -2 : 0
        Behavior on y { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
    }

    MouseArea {
        id: lvlMA
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }

    ColumnLayout {
        id: cardLayout
        anchors { left: parent.left; right: parent.right
                  top: parent.top; margins: 16 }
        spacing: 8

        // 48×48 gradient icon square with white level number
        Rectangle {
            width: 48; height: 48; radius: 12
            gradient: Gradient {
                orientation: Gradient.Vertical
                GradientStop { position: 0.0; color: grad.from }
                GradientStop { position: 1.0; color: grad.to   }
            }

            Text {
                anchors.centerIn: parent
                text: root.level.toString()
                font.pixelSize: 20
                font.weight: Font.Bold
                color: "#ffffff"
            }
        }

        CText {
            text: root.name
            font.pixelSize: 14
            font.weight: Font.Bold
            color: Theme.text
            Layout.fillWidth: true
            wrapMode: Text.Wrap
        }

        CText {
            text: root.desc
            font.pixelSize: 12
            wrapMode: Text.Wrap
            Layout.fillWidth: true
            color: Theme.textSecondary
            lineHeight: 1.4
        }

        Item { Layout.fillHeight: true }

        // Unlocked / Locked badge
        Rectangle {
            width: badgeText.implicitWidth + 14
            height: 20; radius: 10
            color: locked ? borderDefault : Qt.color(grad.from)

            Text {
                id: badgeText
                anchors.centerIn: parent
                text: locked ? "Locked" : "Unlocked"
                font.pixelSize: 10
                font.weight: Font.DemiBold
                color: locked ? Theme.textSecondary : "#ffffff"
            }
        }
    }
}

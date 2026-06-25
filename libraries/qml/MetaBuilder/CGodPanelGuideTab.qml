import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: guideTab
    objectName: "tab_god_panel_guide"
    Accessible.role: Accessible.PageTab
    Accessible.name: "Guide"
    color: "transparent"

    required property var levelData
    required property var configStatData
    required property var levelAccents
    required property bool isDark

    // MD3 tonal surfaces
    readonly property color surfaceContainerHigh:
        isDark ? Qt.rgba(1, 1, 1, 0.08)
               : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color onSurface: Theme.text
    readonly property color onSurfaceVariant: Theme.textSecondary
    readonly property color outlineVariant:
        isDark ? Qt.rgba(1, 1, 1, 0.06)
               : Qt.rgba(0, 0, 0, 0.08)

    ScrollView {
        anchors.fill: parent
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 20

            // Intro section
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: guideIntroCol.implicitHeight + 48
                radius: 16; color: surfaceContainerHigh
                border.width: 1; border.color: outlineVariant

                ColumnLayout {
                    id: guideIntroCol
                    anchors { left: parent.left; right: parent.right
                    top: parent.top; margins: 24 }
                    spacing: 16
                    CText {
                        text: "Builder Quick Reference"
                        font.pixelSize: 22
                        font.weight: Font.Bold
                        color: onSurface
                        Layout.fillWidth: true
                    }
                    CText {
                        text: "MetaBuilder uses a 5-level "
                            + "permission and interface "
                            + "system. Each level unlocks "
                            + "progressively more powerful "
                            + "tools."
                        font.pixelSize: 14
                        wrapMode: Text.Wrap
                        Layout.fillWidth: true
                        color: onSurfaceVariant
                        lineHeight: 1.5
                    }
                }
            }

            // Level cards
            CText {
                text: "Access Levels"
                font.pixelSize: 18
                font.weight: Font.DemiBold
                color: onSurface
                Layout.fillWidth: true
                Layout.topMargin: 4
            }
            Repeater {
                model: guideTab.levelData
                delegate: CLevelReferenceCard {
                    Layout.fillWidth: true
                    levelName: modelData.level
                    role: modelData.role
                    description: modelData.desc
                    accent: guideTab.levelAccents[
                        modelData.accentIndex]
                    levelNumber:
                        modelData.accentIndex + 1
                    isDark: guideTab.isDark
                }
            }

            // Config summary section
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: configSummaryCol.implicitHeight + 48
                Layout.topMargin: 8; radius: 16
                color: surfaceContainerHigh
                border.width: 1; border.color: outlineVariant

                ColumnLayout {
                    id: configSummaryCol
                    anchors { left: parent.left; right: parent.right
                    top: parent.top; margins: 24 }
                    spacing: 16
                    CText {
                        text: "Current Configuration"
                        font.pixelSize: 16
                        font.weight: Font.DemiBold
                        color: onSurface
                        Layout.fillWidth: true
                    }
                    GridLayout {
                        Layout.fillWidth: true
                        columns: Math.max(2, Math.min(4,
                            Math.floor(
                                (parent.width + 12) / 180
                            )))
                        columnSpacing: 12; rowSpacing: 12
                        Repeater {
                            model: guideTab.configStatData
                            delegate: CConfigStatCard {
                                Layout.fillWidth: true
                                label: modelData.label
                                value: modelData.value
                                accent: modelData.accent
                                isDark: guideTab.isDark
                            }
                        }
                    }
                }
            }

            CAlert {
                Layout.fillWidth: true
                severity: "info"
                text: "Philosophy: 95% JSON config,"
                    + " 5% TypeScript/C++ "
                    + "infrastructure. Entities, "
                    + "workflows, pages, and "
                    + "business logic are all "
                    + "declarative."
            }
            Item { Layout.preferredHeight: 16 }
        }
    }
}

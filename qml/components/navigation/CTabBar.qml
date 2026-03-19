import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../theming"

Rectangle {
    id: tabBar

    // Accessibility
    Accessible.role: Accessible.PageTabList
    Accessible.name: "Tab bar"

    property int currentIndex: 0
    property var tabs: [] // [{label, icon}]

    signal tabClicked(int index)

    implicitHeight: 48
    color: "transparent"

    RowLayout {
        anchors.fill: parent
        spacing: 0

        Repeater {
            id: tabRepeater
            model: tabBar.tabs

            Rectangle {
                id: tabDelegate

                // Accessibility
                Accessible.role: Accessible.PageTab
                Accessible.name:
                    modelData.label || modelData
                activeFocusOnTab: true

                readonly property bool isActive:
                    tabBar.currentIndex === index

                Layout.fillHeight: true
                Layout.preferredWidth:
                    tabContent.implicitWidth + 32

                color: "transparent"

                // MD3 state layer on hover
                Rectangle {
                    anchors.fill: parent
                    color: Theme.text
                    opacity: tabMouse.containsMouse
                        && !tabDelegate.isActive
                        ? 0.08 : 0
                    Behavior on opacity {
                        NumberAnimation { duration: 150 }
                    }
                }

                RowLayout {
                    id: tabContent
                    anchors.centerIn: parent
                    spacing: 6

                    Text {
                        text: modelData.icon || ""
                        font.pixelSize: 14
                        color: tabDelegate.isActive
                            ? Theme.primary
                            : Theme.textSecondary
                        visible:
                            modelData.icon !== undefined
                            && modelData.icon !== ""
                        Behavior on color {
                            ColorAnimation {
                                duration: 150
                            }
                        }
                    }

                    Text {
                        text: modelData.label || modelData
                        font.pixelSize: 14
                        font.weight: tabDelegate.isActive
                            ? Font.DemiBold
                            : Font.Medium
                        color: tabDelegate.isActive
                            ? Theme.primary
                            : Theme.textSecondary
                        Behavior on color {
                            ColorAnimation {
                                duration: 150
                            }
                        }
                    }
                }

                MouseArea {
                    id: tabMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        tabBar.currentIndex = index
                        tabBar.tabClicked(index)
                    }
                }
            }
        }

        Item { Layout.fillWidth: true }
    }

    // MD3 active indicator pill
    Rectangle {
        id: activeIndicator
        anchors.bottom: parent.bottom
        height: 3
        radius: 1.5
        color: Theme.primary
        visible: tabRepeater.count > 0

        property Item targetTab:
            tabRepeater.count > 0
            && tabBar.currentIndex >= 0
            && tabBar.currentIndex
                < tabRepeater.count
            ? tabRepeater.itemAt(
                tabBar.currentIndex)
            : null

        x: targetTab ? targetTab.x + 8 : 0
        width: targetTab
            ? targetTab.width - 16 : 0

        Behavior on x {
            NumberAnimation {
                duration: 250
                easing.type: Easing.OutCubic
            }
        }
        Behavior on width {
            NumberAnimation {
                duration: 250
                easing.type: Easing.OutCubic
            }
        }
    }

    // Subtle bottom divider
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        height: 1
        color: Theme.border
        opacity: 0.4
    }
}

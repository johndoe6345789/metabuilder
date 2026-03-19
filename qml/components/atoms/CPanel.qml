import QtQuick
import QtQuick.Layouts
import QtQuick.Effects
import QmlComponents 1.0

/**
 * CPanel.qml - Material Design 3 surface container panel
 * Floating panel with header, body, and footer sections
 *
 * Usage:
 *   CPanel {
 *       title: "Queue Status"
 *       icon: "📋"
 *       collapsible: true
 *
 *       // Content goes in body
 *       Text { text: "Panel content" }
 *   }
 */
Rectangle {
    id: root

    // Public properties
    property string title: ""
    property string icon: ""
    property string variant: "default"  // default, elevated
    // none, fixed-br, fixed-bl, fixed-tr, fixed-tl
    property string position: "none"
    property bool collapsible: false
    property bool collapsed: false
    property string footer: ""

    // Content slot
    default property alias content: bodyContent.data

    // Signals
    signal headerClicked()

    // Size
    implicitWidth: 280
    implicitHeight: collapsed
        ? headerRect.height
        : (headerRect.height
            + bodyLoader.height
            + footerLoader.height)

    // Positioning
    anchors.right: position === "fixed-br"
        || position === "fixed-tr"
        ? parent.right : undefined
    anchors.left: position === "fixed-bl"
        || position === "fixed-tl"
        ? parent.left : undefined
    anchors.bottom: position === "fixed-br"
        || position === "fixed-bl"
        ? parent.bottom : undefined
    anchors.top: position === "fixed-tr"
        || position === "fixed-tl"
        ? parent.top : undefined
    anchors.margins:
        position !== "none" ? 16 : 0

    // MD3 Surface container
    color: Theme.mode === "dark"
        ? Qt.rgba(1, 1, 1, 0.08)
        : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    radius: 16
    border.width: 1
    border.color: Theme.mode === "dark"
        ? Qt.rgba(1, 1, 1, 0.12)
        : Qt.rgba(0, 0, 0, 0.12)

    // MD3 elevation shadow for elevated variant
    layer.enabled: variant === "elevated"
    layer.effect: MultiEffect {
        shadowEnabled: true
        shadowColor: "#30000000"
        shadowBlur: 0.6
        shadowVerticalOffset: 4
        shadowHorizontalOffset: 0
    }

    // Smooth collapse animation
    Behavior on implicitHeight {
        NumberAnimation {
            duration: 250
            easing.type: Easing.OutCubic
        }
    }

    // Layout
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Header
        Rectangle {
            id: headerRect
            Layout.fillWidth: true
            Layout.preferredHeight: 48
            color: Qt.rgba(
                Theme.primary.r,
                Theme.primary.g,
                Theme.primary.b, 0.12)
            radius: root.radius
            visible: root.title
                || root.icon

            // Square off bottom corners
            Rectangle {
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                height: parent.radius
                color: parent.color
                visible: !root.collapsed
            }

            MouseArea {
                anchors.fill: parent
                cursorShape: root.collapsible
                    ? Qt.PointingHandCursor
                    : Qt.ArrowCursor
                onClicked: {
                    if (root.collapsible) {
                        root.collapsed = !root.collapsed
                    }
                    root.headerClicked()
                }
            }

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 16
                anchors.rightMargin: 16
                spacing: 12

                // Icon
                Text {
                    visible: root.icon
                    text: root.icon
                    font.pixelSize: 16
                    color: Theme.primary
                }

                // Title
                Text {
                    Layout.fillWidth: true
                    text: root.title
                    font.pixelSize: 14
                    font.weight: Font.Medium
                    font.letterSpacing: 0.1
                    color: Theme.text
                    elide: Text.ElideRight
                }

                // Collapse indicator
                Text {
                    visible: root.collapsible
                    text: root.collapsed ? "▼" : "▲"
                    font.pixelSize: 10
                    color: Theme.textSecondary
                }
            }
        }

        // Body
        Loader {
            id: bodyLoader
            Layout.fillWidth: true
            active: !root.collapsed
            visible: active

            sourceComponent: Rectangle {
                width: bodyLoader.width
                height: Math.min(
                    bodyContent.implicitHeight + 32,
                    332)
                color: "transparent"
                clip: true

                Flickable {
                    anchors.fill: parent
                    anchors.topMargin: 16
                    anchors.bottomMargin: 16
                    anchors.leftMargin: 16
                    anchors.rightMargin: 16
                    contentHeight:
                        bodyContent.implicitHeight
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds

                    ColumnLayout {
                        id: bodyContent
                        width: parent.width
                        spacing: 8
                    }

                    ScrollBar.vertical: ScrollBar {
                        policy:
                            bodyContent.implicitHeight > 300
                                ? ScrollBar.AsNeeded
                                : ScrollBar.AlwaysOff
                    }
                }
            }
        }

        // Footer
        Loader {
            id: footerLoader
            Layout.fillWidth: true
            active: root.footer
                && !root.collapsed
            visible: active

            sourceComponent: Rectangle {
                width: footerLoader.width
                height: 40
                color: "transparent"

                // Top border
                Rectangle {
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: 1
                    color: Theme.mode === "dark"
                        ? Qt.rgba(1, 1, 1, 0.12)
                        : Qt.rgba(0, 0, 0, 0.12)
                }

                Text {
                    anchors.centerIn: parent
                    text: root.footer
                    font.pixelSize: 12
                    font.letterSpacing: 0.4
                    color: Theme.textSecondary
                }
            }
        }
    }
}

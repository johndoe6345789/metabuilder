import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CAccordionItem.qml - Material Design 3 expandable accordion item
 *
 * Rounded 12 px container with smooth height animation.
 * Used inside CAccordion; pairs with CCard visual language.
 */
Rectangle {
    id: root
    objectName: "CAccordionItem"

    // ── Public properties ──────────────
    property string title: ""
    property string icon: ""
    property string subtitle: ""
    property bool expanded: false
    property bool disabled: false

    // Internal - set by parent accordion
    property int index: 0
    property var accordion: null

    // Content slot
    default property alias content: contentColumn.data

    // ── MD3 surface tints ──────────────
    readonly property bool isDark: Theme.mode === "dark"
    readonly property color surfaceContainer:
        isDark ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)

    Accessible.role: Accessible.Button
    Accessible.name: title
    Accessible.expanded: expanded
    activeFocusOnTab: true

    // -- Layout --
    Layout.fillWidth: true
    radius: 12
    clip: true

    implicitHeight: headerRect.height + (expanded ? contentWrapper.height : 0)
    implicitWidth: 300

    color: surfaceContainer

    Behavior on implicitHeight {
        NumberAnimation {
            duration: StyleVariables.transitionNormal
            easing.type: Easing.OutCubic
        }
    }

    Behavior on color {
        ColorAnimation { duration: StyleVariables.transitionFast } }

    // -- Header --
    Rectangle {
        id: headerRect
        width: parent.width
        height: 52
        radius: root.radius
        color: headerMouse.containsMouse && !root.disabled
            ? StyleMixins.hoverBg(root.isDark)
            : "transparent"

        Behavior on color {
            ColorAnimation { duration: StyleVariables.transitionFast } }

        MouseArea {
            id: headerMouse
            anchors.fill: parent
            hoverEnabled: !root.disabled
            cursorShape: root.disabled
                ? Qt.ForbiddenCursor : Qt.PointingHandCursor

            onClicked: {
                if (!root.disabled) {
                    root.expanded = !root.expanded
                    if (root.accordion) {
                        root.accordion.setExpanded(root.index, root.expanded)
                    }
                }
            }
        }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 16
            anchors.rightMargin: 16
            spacing: StyleVariables.spacingSm

            // Icon
            Text {
                visible: root.icon !== ""
                text: root.icon
                font.pixelSize: StyleVariables.fontSizeLg
                color: root.disabled ? Theme.textDisabled : Theme.text
            }

            // Title and subtitle
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 2

                Text {
                    text: root.title
                    font.pixelSize: StyleVariables.fontSizeSm
                    font.weight: Font.Medium
                    color: root.disabled ? Theme.textDisabled : Theme.text
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }

                Text {
                    visible: root.subtitle !== ""
                    text: root.subtitle
                    font.pixelSize: StyleVariables.fontSizeXs
                    color: Theme.textSecondary
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
            }

            // Expand chevron
            Text {
                text: "\u25BC"
                font.pixelSize: 10
                color: root.disabled ? Theme.textDisabled : Theme.textSecondary
                rotation: root.expanded ? 180 : 0

                Behavior on rotation {
                    NumberAnimation {
                        duration: StyleVariables.transitionNormal
                        easing.type: Easing.OutCubic
                    }
                }
            }
        }

        // Divider between header and content
        Rectangle {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.leftMargin: 16
            anchors.rightMargin: 16
            height: root.expanded ? 1 : 0
            color: Theme.divider
            opacity: root.expanded ? 1 : 0

            Behavior on opacity {
                NumberAnimation { duration: StyleVariables.transitionFast }
            }
        }
    }

    // -- Content area --
    Item {
        id: contentWrapper
        anchors.top: headerRect.bottom
        width: parent.width
        height: root.expanded ? contentColumn.implicitHeight + 32 : 0
        visible: root.expanded
        clip: true

        ColumnLayout {
            id: contentColumn
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.top: parent.top
            anchors.margins: 16
            spacing: StyleVariables.spacingSm
        }
    }
}

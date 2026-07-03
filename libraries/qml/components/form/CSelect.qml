import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CSelect.qml - Material Design 3 outlined select (ComboBox wrapper)
 *
 * Outlined variant matching CTextField styling with dropdown popup,
 * surface background, elevation shadow, and arrow indicator.
 */
ComboBox {
    id: root

    property string label: ""
    property string helper: ""
    property string errorText: ""
    property bool hasError: errorText.length > 0
    property string size: "md" // "sm", "md", "lg"

    // Accessibility
    Accessible.role: Accessible.ComboBox
    Accessible.name: label || ""
    activeFocusOnTab: true

    model: []
    Layout.preferredWidth: 200
    implicitHeight: size === "sm"
        ? 40
        : (size === "lg" ? 56 : 48)

    font.pixelSize: 14
    font.family: Theme.fontFamily

    // Content item (selected value display)
    contentItem: Text {
        leftPadding: 16
        rightPadding: 40
        verticalAlignment: Text.AlignVCenter
        text: root.displayText
        font: root.font
        color: root.enabled
            ? Theme.text
            : Theme.textDisabled
        elide: Text.ElideRight
    }

    // Arrow indicator
    indicator: Item {
        width: 40
        height: root.height
        anchors.right: parent.right

        Text {
            anchors.centerIn: parent
            text: root.popup.visible
                ? "\u25B2" : "\u25BC"
            font.pixelSize: 10
            color: {
                if (!root.enabled) return Theme.textDisabled
                if (root.activeFocus) return Theme.primary
                return Theme.textSecondary
            }

            Behavior on color {
                ColorAnimation {
                    duration: Theme.transitionShortest
                }
            }
        }
    }

    // Outlined background matching CTextField
    background: Rectangle {
        id: bg
        radius: 8
        color: root.activeFocus
            ? Qt.rgba(
                Theme.primary.r,
                Theme.primary.g,
                Theme.primary.b, 0.04)
            : "transparent"
        border.width: root.activeFocus
            ? 2 : 1
        border.color: {
            if (!root.enabled) return Theme.actionDisabled
            if (root.hasError) return Theme.error
            if (root.activeFocus) return Theme.primary
            if (bgHover.containsMouse) return Theme.text
            return Theme.border
        }

        Behavior on border.color {
            ColorAnimation {
                duration: Theme.transitionShortest
            }
        }
        Behavior on border.width {
            NumberAnimation {
                duration: Theme.transitionShortest
            }
        }
        Behavior on color {
            ColorAnimation {
                duration: Theme.transitionShortest
            }
        }

        MouseArea {
            id: bgHover
            anchors.fill: parent
            hoverEnabled: true
            acceptedButtons: Qt.NoButton
            cursorShape: Qt.PointingHandCursor
        }

        // Floating label
        Text {
            id: floatingLabel
            text: root.label
            visible: root.label.length > 0
            font.pixelSize:
                (root.activeFocus
                    || root.currentIndex >= 0)
                ? 11 : 14
            font.family: Theme.fontFamily
            font.weight: Font.Medium
            color: {
                if (!root.enabled) return Theme.textDisabled
                if (root.hasError) return Theme.error
                if (root.activeFocus) return Theme.primary
                return Theme.textSecondary
            }

            x: 16
            y: (root.activeFocus
                    || root.currentIndex >= 0)
                ? 6
                : (parent.height - height) / 2

            Behavior on y {
                NumberAnimation {
                    duration: Theme.transitionShortest
                    easing.type: Easing.OutCubic
                }
            }
            Behavior on font.pixelSize {
                NumberAnimation {
                    duration: Theme.transitionShortest
                    easing.type: Easing.OutCubic
                }
            }
            Behavior on color {
                ColorAnimation {
                    duration: Theme.transitionShortest
                }
            }
        }
    }

    // Dropdown popup
    popup: Popup {
        y: root.height + 4
        width: root.width
        implicitHeight: contentItem.implicitHeight + 16
        padding: 8

        contentItem: ListView {
            clip: true
            implicitHeight: contentHeight
            model: root.popup.visible
                ? root.delegateModel : null
            currentIndex: root.highlightedIndex
            ScrollIndicator.vertical: ScrollIndicator {}
        }

        background: Rectangle {
            radius: 8
            color: Theme.surface
            border.width: 1
            border.color: Theme.border

            // Elevation shadow
            layer.enabled: true
            layer.effect: Item {
                Rectangle {
                    anchors.fill: parent
                    anchors.margins: -2
                    radius: 10
                    color: "transparent"
                    border.width: 0

                    Rectangle {
                        anchors.fill: parent
                        anchors.topMargin: 2
                        radius: 10
                        color: Qt.rgba(0, 0, 0, 0.12)
                        z: -1
                    }
                }
            }
        }
    }

    // Delegate for each item in the dropdown
    delegate: ItemDelegate {
        id: itemDelegate
        width: root.width - 16
        height: 40
        leftPadding: 16

        contentItem: Text {
            text: modelData !== undefined
                ? modelData
                : (model.display !== undefined
                    ? model.display : "")
            font.pixelSize: 14
            font.family: Theme.fontFamily
            color: itemDelegate.highlighted
                ? Theme.primary : Theme.text
            verticalAlignment: Text.AlignVCenter
            elide: Text.ElideRight
        }

        background: Rectangle {
            radius: 4
            color: {
                if (itemDelegate.highlighted)
                    return Qt.rgba(
                        Theme.primary.r,
                        Theme.primary.g,
                        Theme.primary.b,
                        0.12)
                if (itemDelegate.hovered)
                    return Theme.actionHover
                return "transparent"
            }

            Behavior on color {
                ColorAnimation {
                    duration: Theme.transitionShortest
                }
            }
        }

        highlighted:
            root.highlightedIndex === index
    }

    // Helper / error text below the field
    Text {
        id: helperText
        parent: root.parent
        x: root.x + 16
        y: root.y + root.height + 4
        width: root.width - 16
        text: root.hasError
            ? root.errorText : root.helper
        font.pixelSize: 11
        font.family: Theme.fontFamily
        color: root.hasError
            ? Theme.error
            : Theme.textSecondary
        visible: text.length > 0
    }
}

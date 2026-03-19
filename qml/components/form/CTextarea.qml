import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * CTextarea.qml - Material Design 3 outlined multi-line text area
 *
 * Same outline treatment as CTextField but supports multiple lines.
 * Min height 100px, grows with content.
 */
ScrollView {
    id: root

    property alias text: textArea.text
    property alias placeholderText: textArea.placeholderText
    property alias readOnly: textArea.readOnly
    property alias wrapMode: textArea.wrapMode
    property alias font: textArea.font
    property alias textDocument: textArea.textDocument
    property string label: ""
    property string helper: ""
    property string errorText: ""
    property bool hasError: errorText.length > 0
    property string size: "md" // "sm", "md", "lg"
    property alias activeFocus: textArea.activeFocus
    property bool enabled: true
    property int minHeight: 100
    property int maxHeight: 400

    signal textChanged()

    implicitWidth: 200
    implicitHeight: Math.max(
        minHeight,
        Math.min(
            textArea.implicitHeight + 32,
            maxHeight))
    clip: true

    ScrollBar.vertical.policy:
        textArea.implicitHeight + 32 > root.maxHeight
            ? ScrollBar.AsNeeded
            : ScrollBar.AlwaysOff
    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff

    TextArea {
        id: textArea

        // Accessibility
        Accessible.role: Accessible.EditableText
        Accessible.name:
            root.label || placeholderText || ""
        Accessible.description: root.helper || ""
        activeFocusOnTab: true
        objectName: "input_"
            + (root.label || "field")
                .toLowerCase().replace(/ /g, "_")

        wrapMode: Text.WordWrap
        font.pixelSize: 14
        font.family: Theme.fontFamily
        color: root.enabled
            ? Theme.text
            : Theme.textDisabled
        placeholderTextColor: Theme.textSecondary
        selectionColor: Theme.primary
        selectedTextColor: Theme.primaryContrastText
        enabled: root.enabled

        leftPadding: 16
        rightPadding: 16
        topPadding: root.label.length > 0 ? 24 : 14
        bottomPadding: 14

        onTextChanged: root.textChanged()

        background: Rectangle {
            id: bg
            radius: 8
            color: textArea.activeFocus
                ? Qt.rgba(
                    Theme.primary.r,
                    Theme.primary.g,
                    Theme.primary.b, 0.04)
                : "transparent"
            border.width: textArea.activeFocus
                ? 2 : 1
            border.color: {
                if (!root.enabled) return Theme.actionDisabled
                if (root.hasError) return Theme.error
                if (textArea.activeFocus) return Theme.primary
                if (bgHover.containsMouse)
                    return Theme.text
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
                cursorShape: Qt.IBeamCursor
            }

            // Floating label
            Text {
                id: floatingLabel
                text: root.label
                visible: root.label.length > 0
                font.pixelSize:
                    (textArea.activeFocus
                        || textArea.text.length > 0)
                    ? 11 : 14
                font.family: Theme.fontFamily
                font.weight: Font.Medium
                color: {
                    if (!root.enabled) return Theme.textDisabled
                    if (root.hasError) return Theme.error
                    if (textArea.activeFocus) return Theme.primary
                    return Theme.textSecondary
                }

                x: 16
                y: (textArea.activeFocus
                        || textArea.text.length > 0)
                    ? 6 : 14

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
    }

    // Helper / error text below the field
    Text {
        id: helperText
        parent: root.parent
        anchors.top: root.bottom
        anchors.topMargin: 4
        anchors.left: root.left
        anchors.leftMargin: 16
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

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CDialog.qml - Material Design 3 Dialog
 * Overlay dialog with header, content, and footer
 */
Popup {
    id: root

    objectName: "dialog_" + title.toLowerCase()
        .replace(/ /g, "_")

    property string title: ""
    property string size: "md"           // sm, md, lg, xl
    property bool showClose: true
    property alias dialogContent: contentArea.data
    property alias footerItem: footerArea.data

    // MD3 size mapping (min 280, max 560 for default)
    readonly property int _maxWidth: {
        switch (size) {
            case "sm": return 360
            case "lg": return 560
            case "xl": return 560
            default: return 480
        }
    }

    readonly property int _minWidth: 280

    modal: true
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutside
    anchors.centerIn: parent

    width: Math.max(_minWidth, Math.min(_maxWidth, parent.width - 48))

    // MD3 open animation: scale + opacity
    enter: Transition {
        ParallelAnimation {
            NumberAnimation { property: "opacity"; from: 0; to: 1; duration: 250
            easing.type: Easing.OutCubic }
            NumberAnimation { property: "scale"; from: 0.85; to: 1.0
            duration: 250; easing.type: Easing.OutCubic }
        }
    }

    // MD3 close animation
    exit: Transition {
        ParallelAnimation {
            NumberAnimation { property: "opacity"; from: 1; to: 0; duration: 200
            easing.type: Easing.InCubic }
            NumberAnimation { property: "scale"; from: 1.0; to: 0.85
            duration: 200; easing.type: Easing.InCubic }
        }
    }

    // MD3 scrim/backdrop
    Overlay.modal: Rectangle {
        color: Qt.rgba(0, 0, 0, 0.4)

        Behavior on opacity { NumberAnimation { duration: 200 } }
    }

    // MD3 surface container background with large radius
    background: Rectangle {
        color: Theme.surface
        radius: 28

        // MD3 elevation shadow
        layer.enabled: true
        layer.effect: Item {
            Rectangle {
                anchors.fill: parent
                anchors.margins: -8
                color: "transparent"

                Rectangle {
                    anchors.fill: parent
                    anchors.margins: 8
                    color: "#000000"
                    opacity: 0.18
                    radius: 32
                }
            }
        }
    }

    contentItem: ColumnLayout {
        spacing: 0

        // Header
        ColumnLayout {
            Layout.fillWidth: true
            Layout.topMargin: 24
            Layout.leftMargin: 24
            Layout.rightMargin: 24
            Layout.bottomMargin: 16
            spacing: 0
            visible: root.title !== "" || root.showClose

            RowLayout {
                Layout.fillWidth: true
                spacing: 8

                Text {
                    Layout.fillWidth: true
                    text: root.title
                    color: Theme.text
                    font.pixelSize: 24
                    font.weight: Font.Bold
                    elide: Text.ElideRight
                }

                // MD3 close button (circular, subtle)
                Rectangle {
                    visible: root.showClose
                    width: 32
                    height: 32
                    radius: 16
                    color: closeHover.containsMouse
                        ? Theme.actionHover : "transparent"

                    Text {
                        anchors.centerIn: parent
                        text: "✕"
                        font.pixelSize: 16
                        color: Theme.textSecondary
                    }

                    MouseArea {
                        id: closeHover
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: root.close()
                    }
                }
            }
        }

        // Content area
        Item {
            id: contentArea
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.leftMargin: 24
            Layout.rightMargin: 24
            Layout.bottomMargin: 8
            implicitHeight: childrenRect.height
        }

        // Footer with right-aligned text buttons (MD3 pattern)
        Item {
            id: footerArea
            Layout.fillWidth: true
            Layout.leftMargin: 24
            Layout.rightMargin: 24
            Layout.bottomMargin: 24
            Layout.topMargin: 8
            implicitHeight: childrenRect.height
            visible: children.length > 0
        }
    }
}

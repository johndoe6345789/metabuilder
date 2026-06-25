import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CCodeBlock.qml - Material Design 3 code block
 * Displays code with optional line numbers, copy button, and horizontal scroll
 */
Rectangle {
    id: root

    property string code: ""
    property string language: ""
    property bool showCopy: true
    property bool showLineNumbers: false
    property int maxHeight: 400

    color: Qt.lighter(Theme.surface, 1.15)
    radius: 12

    implicitWidth: parent ? parent.width : 400
    implicitHeight: Math.min(contentCol.implicitHeight + 32, maxHeight)

    ColumnLayout {
        id: contentCol
        anchors.fill: parent
        anchors.margins: 16
        spacing: 8

        // Header with language label and copy button
        RowLayout {
            Layout.fillWidth: true
            visible: root.language !== "" || root.showCopy

            Text {
                text: root.language
                color: Theme.textSecondary
                font.pixelSize: 12
                font.family: Theme.fontFamilyMono
                font.weight: Font.Medium
                visible: root.language !== ""
            }

            Item { Layout.fillWidth: true }

            CButton {
                text: "Copy"
                size: "sm"
                variant: "text"
                visible: root.showCopy
                onClicked: {
                    text = "Copied!"
                    copyTimer.start()
                }

                Timer {
                    id: copyTimer
                    interval: 2000
                    onTriggered: parent.text = "Copy"
                }
            }
        }

        // Scrollable code content
        Flickable {
            Layout.fillWidth: true
            Layout.fillHeight: true
            contentWidth: codeRow.implicitWidth
            contentHeight: codeRow.implicitHeight
            clip: true
            boundsBehavior: Flickable.StopAtBounds

            ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }
            ScrollBar.horizontal: ScrollBar { policy: ScrollBar.AsNeeded }

            RowLayout {
                id: codeRow
                spacing: 12

                // Line numbers column
                Column {
                    visible: root.showLineNumbers
                    spacing: 0

                    Repeater {
                        model: root.code.split('\n').length

                        Text {
                            text: (index + 1).toString()
                            color: Theme.textSecondary
                            font.family: Theme.fontFamilyMono
                            font.pixelSize: 14
                            horizontalAlignment: Text.AlignRight
                            width: 32
                            opacity: 0.6
                        }
                    }
                }

                // Code text
                Text {
                    id: codeText
                    text: root.code
                    color: Theme.text
                    font.family: Theme.fontFamilyMono
                    font.pixelSize: 14
                    textFormat: Text.PlainText
                    wrapMode: Text.NoWrap
                }
            }
        }
    }
}

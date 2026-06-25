import QtQuick
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CErrorState.qml - Material Design 3 Error State
 *
 * MD3 spec: Centered layout with tonal surface container, large icon,
 * headline title, body description, and filled action button.
 *
 * Usage:
 *   CErrorState {
 *       title: "Connection failed"
 *       message: "Check your internet and try again."
 *       onRetry: reloadData()
 *   }
 */
Rectangle {
    id: root

    // Public properties
    property string title: "Something went wrong"
    property string message: ""
    property string icon: "\u26A0"      // Warning symbol (Unicode)
    property string size: "md"          // sm, md, lg
    property bool showRetry: true
    property string retryText: "Try Again"

    signal retry()

    // MD3 tonal surface container
    color: Qt.rgba(Theme.surface.r, Theme.surface.g, Theme.surface.b, 0.7)
    radius: 16
    border.width: 1
    border.color: Qt.rgba(Theme.border.r, Theme.border.g, Theme.border.b, 0.3)

    implicitWidth: parent ? parent.width : 400
    implicitHeight: contentCol.implicitHeight + Theme.spacingXl * 2

    ColumnLayout {
        id: contentCol
        anchors.centerIn: parent
        width: Math.min(parent.width - Theme.spacingXl * 2, 360)
        spacing: Theme.spacingMd

        // MD3 large icon (48px)
        Rectangle {
            Layout.alignment: Qt.AlignHCenter
            width: 72
            height: 72
            radius: 36
            color: Qt.rgba(Theme.error.r, Theme.error.g, Theme.error.b, 0.12)

            Text {
                anchors.centerIn: parent
                text: root.icon
                font.pixelSize: 48
                color: Theme.error
            }
        }

        // MD3 headline: h5 weight
        Text {
            Layout.alignment: Qt.AlignHCenter
            Layout.fillWidth: true
            text: root.title
            color: Theme.text
            font.pixelSize: Theme.fontSizeH5
            font.weight: Font.Medium
            font.family: Theme.fontFamily
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.Wrap
        }

        // MD3 body: body2, textSecondary
        Text {
            Layout.alignment: Qt.AlignHCenter
            Layout.fillWidth: true
            text: root.message
            color: Theme.textSecondary
            font.pixelSize: Theme.fontSizeSm
            font.family: Theme.fontFamily
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.Wrap
            lineHeight: 1.5
            visible: root.message !== ""
        }

        // Spacer before button
        Item {
            Layout.fillWidth: true
            height: Theme.spacingXs
            visible: root.showRetry
        }

        // MD3 filled button
        Rectangle {
            Layout.alignment: Qt.AlignHCenter
            width: buttonLabel.implicitWidth + Theme.spacingLg * 2
            height: 40
            radius: 20
            color: buttonArea.containsMouse
                ? Qt.lighter(Theme.primary, 1.15) : Theme.primary
            visible: root.showRetry

            Text {
                id: buttonLabel
                anchors.centerIn: parent
                text: root.retryText
                color: Theme.primaryContrastText
                font.pixelSize: Theme.fontSizeSm
                font.weight: Font.Medium
                font.family: Theme.fontFamily
                font.letterSpacing: 0.5
            }

            MouseArea {
                id: buttonArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: root.retry()
            }

            Behavior on color {
                ColorAnimation { duration: Theme.transitionShortest }
            }
        }
    }
}

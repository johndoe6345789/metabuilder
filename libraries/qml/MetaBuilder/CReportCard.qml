import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

Rectangle {
    id: root

    required property var report
    property bool isDark: false
    visible: root.report != null

    readonly property var _r: root.report || {
        type: "", content: "", reporter: "", status: ""
    }

    signal dismiss()
    signal takeAction()

    readonly property color surfaceContainerHigh: isDark
        ? Qt.rgba(1, 1, 1, 0.08) : Qt.rgba(0.31, 0.31, 0.44, 0.10)
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)
    readonly property color onSurfaceVariant: Theme.textSecondary

    Layout.fillWidth: true
    Layout.preferredHeight: 72
    radius: 12
    color: surfaceContainerHigh
    border.color: outlineVariant
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        // Type indicator bar
        Rectangle {
            width: 4
            height: 36
            radius: 2
            color: root._r.type === "spam" ? "#F43F5E" :
                   root._r.type === "abuse" ? "#EF4444" :
                   "#F59E0B"
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2
            CText {
                text: root._r.content
                font.pixelSize: 13
                elide: Text.ElideRight
                Layout.fillWidth: true
            }
            CText {
                text: root._r.type + " \u00B7 " + root._r.user + "
                    \u00B7 " + root._r.reported
                font.pixelSize: 11
                color: root.onSurfaceVariant
            }
        }

        CButton {
            text: "Dismiss"
            variant: "ghost"
            size: "sm"
            onClicked: root.dismiss()
        }
        CButton {
            text: "Action"
            variant: "primary"
            size: "sm"
            onClicked: root.takeAction()
        }
    }
}

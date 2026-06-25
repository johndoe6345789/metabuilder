import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

// Language selector pill (e.g. "EN")
Item {
    id: root
    Accessible.role: Accessible.Button
    Accessible.name: "Language: "
        + currentLanguage

    property string currentLanguage: "EN"
    property bool isDark: Theme.mode === "dark"

    signal clicked()

    width: langText.implicitWidth + 20
    height: 28
    activeFocusOnTab: true
    Keys.onReturnPressed: root.clicked()
    Keys.onSpacePressed: root.clicked()

    // ── MD3 palette ──
    readonly property color surfaceContainer: isDark
        ? Qt.rgba(1, 1, 1, 0.05) : Qt.rgba(0.31, 0.31, 0.44, 0.06)
    readonly property color outlineVariant: isDark
        ? Qt.rgba(1, 1, 1, 0.06) : Qt.rgba(0, 0, 0, 0.08)

    Rectangle {
        anchors.fill: parent
        radius: 14
        color: surfaceContainer
        border.color: outlineVariant
        border.width: 1

        CText {
            id: langText
            anchors.centerIn: parent
            text: root.currentLanguage
            font.pixelSize: 11
            font.weight: Font.Bold
            font.family: "monospace"
            color: Theme.textSecondary
        }

        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: root.clicked()
        }
    }
}

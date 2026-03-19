import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

/**
 * CThemePicker - Theme selection grid showing all available themes.
 *
 * Reads from Theme.themeKeys and Theme.themes singleton.
 * Emits themeSelected(name) when user picks a theme.
 */
ColumnLayout {
    id: root
    spacing: 8

    property string currentTheme: Theme.current
    property bool isDark: Theme.mode === "dark"

    signal themeSelected(string name)

    CText {
        variant: "subtitle2"
        text: "Theme"
        Layout.topMargin: 4
    }

    Flow {
        Layout.fillWidth: true
        spacing: 8

        Repeater {
            model: Theme.themeKeys

            delegate: CButton {
                property string themeId: modelData
                property var themeObj: Theme.themes[themeId] || {}

                text: themeObj.name || themeId
                variant: root.currentTheme === themeId ? "primary" : "default"
                size: "sm"

                onClicked: {
                    root.currentTheme = themeId
                    root.themeSelected(themeId)
                }
            }
        }
    }
}

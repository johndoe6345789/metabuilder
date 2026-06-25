import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"
import "qmllib/MetaBuilder/ThemeEditorLogic.js" as TELogic

Rectangle {
    id: root
    color: Theme.background
    objectName: "view_theme_editor"
    Accessible.role: Accessible.Pane
    Accessible.name: "Theme Editor"

    property string selectedTheme: "dark"
    property bool hasUnsavedChanges: false
    property string customPrimary: Theme.primary
    property string customBackground: Theme.background
    property string customSurface: Theme.surface
    property string customPaper: Theme.paper
    property string customText: Theme.text
    property string customTextSecondary: Theme.textSecondary
    property string customBorder: Theme.border
    property string customError: Theme.error
    property string customWarning: Theme.warning
    property string customSuccess: Theme.success
    property string customInfo: Theme.info
    property string fontFamily: "Inter"
    property int baseFontSize: 14
    property int baseSpacing: 8
    property int radiusSmall: 4
    property int radiusMedium: 8
    property int radiusLarge: 16
    property var themeDefinitions: TELogic.loadJson(
        Qt.resolvedUrl(
            "qmllib/MetaBuilder/data/theme-definitions.json"
        )
    )

    ScrollView {
        anchors.fill: parent; clip: true
        anchors.margins: 24
        contentWidth: availableWidth
        ColumnLayout {
            width: parent.width; spacing: 20
            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CText {
                    variant: "h3"; text: "Theme Editor"
                }
                Item { Layout.fillWidth: true }
                CBadge {
                    text: hasUnsavedChanges
                        ? "Unsaved changes" : "Synced"
                }
            }
            CText {
                variant: "body2"
                text: "Customize the look and feel of "
                    + "your MetaBuilder workspace. "
                    + "Select a preset theme or "
                    + "fine-tune individual color tokens."
                Layout.fillWidth: true
            }

            ThemePresetGrid {
                selectedTheme: root.selectedTheme
                radiusMedium: root.radiusMedium
                themeDefinitions: root.themeDefinitions
                onThemeSelected: function(name) {
                    root.selectedTheme = name
                    hasUnsavedChanges = true
                }
            }

            ThemeColorTokens {
                customPrimary: root.customPrimary
                customBackground: root.customBackground
                customSurface: root.customSurface
                customPaper: root.customPaper
                customText: root.customText
                customTextSecondary: root.customTextSecondary
                customBorder: root.customBorder
                customError: root.customError
                customWarning: root.customWarning
                customSuccess: root.customSuccess
                customInfo: root.customInfo
                onColorChanged: function(token, value) {
                    TELogic.applyColorChange(
                        root, token, value
                    )
                    hasUnsavedChanges = true
                }
            }

            ThemeTypography {
                fontFamily: root.fontFamily
                baseFontSize: root.baseFontSize
                onFontFamilyChanged: function(f) {
                    root.fontFamily = f
                    hasUnsavedChanges = true
                }
                onBaseFontSizeChanged: function(s) {
                    root.baseFontSize = s
                    hasUnsavedChanges = true
                }
            }

            ThemeSpacingRadius {
                baseSpacing: root.baseSpacing
                radiusSmall: root.radiusSmall
                radiusMedium: root.radiusMedium
                radiusLarge: root.radiusLarge
                onBaseSpacingEdited: function(v) {
                    root.baseSpacing = v
                    hasUnsavedChanges = true
                }
                onRadiusSmallEdited: function(v) {
                    root.radiusSmall = v
                    hasUnsavedChanges = true
                }
                onRadiusMediumEdited: function(v) {
                    root.radiusMedium = v
                    hasUnsavedChanges = true
                }
                onRadiusLargeEdited: function(v) {
                    root.radiusLarge = v
                    hasUnsavedChanges = true
                }
            }

            ThemeLivePreview {
                customPrimary: root.customPrimary
                customBackground: root.customBackground
                customSurface: root.customSurface
                customPaper: root.customPaper
                customText: root.customText
                customTextSecondary: root.customTextSecondary
                customBorder: root.customBorder
                customError: root.customError
                customWarning: root.customWarning
                customSuccess: root.customSuccess
                customInfo: root.customInfo
                fontFamily: root.fontFamily
                baseFontSize: root.baseFontSize
                radiusSmall: root.radiusSmall
                radiusMedium: root.radiusMedium
            }

            FlexRow {
                Layout.fillWidth: true; spacing: 12
                CButton {
                    text: "Reset to Default"
                    variant: "ghost"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name:
                        "Reset theme to defaults"
                    Keys.onReturnPressed:
                        TELogic.resetToDefaults(
                            root, Theme)
                    onClicked: TELogic.resetToDefaults(
                        root, Theme)
                }
                Item { Layout.fillWidth: true }
                CButton {
                    text: "Apply Theme"
                    variant: "primary"
                    activeFocusOnTab: true
                    Accessible.role: Accessible.Button
                    Accessible.name: "Apply theme"
                    Keys.onReturnPressed: {
                        hasUnsavedChanges = false
                        feedbackAlert.visible = true
                        feedbackTimer.restart()
                    }
                    onClicked: {
                        hasUnsavedChanges = false
                        feedbackAlert.visible = true
                        feedbackTimer.restart()
                    }
                }
            }
            CAlert {
                id: feedbackAlert
                Layout.fillWidth: true
                severity: "success"
                text: "Theme applied successfully"
                visible: false
            }
            Item { Layout.preferredHeight: 20 }
        }
    }

    Timer {
        id: feedbackTimer
        interval: 3000
        onTriggered: feedbackAlert.visible = false
    }
}

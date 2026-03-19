import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0
import "qmllib/MetaBuilder"

Rectangle {
    id: root
    color: Theme.background

    // Local state
    property string selectedTheme: "dark"
    property bool hasUnsavedChanges: false

    // Color customization state
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

    // Typography state
    property string fontFamily: "Inter"
    property int baseFontSize: 14

    // Spacing state
    property int baseSpacing: 8

    // Border radius state
    property int radiusSmall: 4
    property int radiusMedium: 8
    property int radiusLarge: 16

    // Theme definitions for the selector grid
    property var themeDefinitions: [
        { name: "dark",          label: "Dark",          bg: "#1a1a2e", surface: "#252542", primary: "#6c63ff", text: "#e0e0e0" },
        { name: "light",         label: "Light",         bg: "#fafafa", surface: "#ffffff", primary: "#1976d2", text: "#212121" },
        { name: "midnight",      label: "Midnight",      bg: "#0d1117", surface: "#161b22", primary: "#58a6ff", text: "#c9d1d9" },
        { name: "forest",        label: "Forest",        bg: "#1b2d1b", surface: "#243524", primary: "#4caf50", text: "#c8e6c9" },
        { name: "ocean",         label: "Ocean",         bg: "#0a1929", surface: "#132f4c", primary: "#5090d3", text: "#b2bac2" },
        { name: "sunset",        label: "Sunset",        bg: "#2d1b1b", surface: "#3d2525", primary: "#ff7043", text: "#ffccbc" },
        { name: "rose",          label: "Rose",          bg: "#2d1b25", surface: "#3d2535", primary: "#f06292", text: "#f8bbd0" },
        { name: "highContrast",  label: "High Contrast", bg: "#000000", surface: "#1a1a1a", primary: "#ffff00", text: "#ffffff" },
        { name: "system",        label: "System",        bg: "#2b2b2b", surface: "#363636", primary: "#90caf9", text: "#e0e0e0" }
    ]

    ScrollView {
        anchors.fill: parent
        anchors.margins: 24
        clip: true
        contentWidth: availableWidth

        ColumnLayout {
            width: parent.width
            spacing: 20

            // Header
            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CText { variant: "h3"; text: "Theme Editor" }
                Item { Layout.fillWidth: true }
                CBadge { text: hasUnsavedChanges ? "Unsaved changes" : "Synced" }
            }

            CText {
                variant: "body2"
                text: "Customize the look and feel of your MetaBuilder workspace. Select a preset theme or fine-tune individual color tokens."
                Layout.fillWidth: true
            }

            // Section 1: Theme Presets
            ThemePresetGrid {
                selectedTheme: root.selectedTheme
                radiusMedium: root.radiusMedium
                themeDefinitions: root.themeDefinitions
                onThemeSelected: function(name) { root.selectedTheme = name; hasUnsavedChanges = true }
            }

            // Section 2: Color Tokens
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
                    switch (token) {
                        case "primary": root.customPrimary = value; break
                        case "background": root.customBackground = value; break
                        case "surface": root.customSurface = value; break
                        case "paper": root.customPaper = value; break
                        case "text": root.customText = value; break
                        case "textSecondary": root.customTextSecondary = value; break
                        case "border": root.customBorder = value; break
                        case "error": root.customError = value; break
                        case "warning": root.customWarning = value; break
                        case "success": root.customSuccess = value; break
                        case "info": root.customInfo = value; break
                    }
                    hasUnsavedChanges = true
                }
            }

            // Section 3: Typography
            ThemeTypography {
                fontFamily: root.fontFamily
                baseFontSize: root.baseFontSize
                onFontFamilyChanged: function(family) { root.fontFamily = family; hasUnsavedChanges = true }
                onBaseFontSizeChanged: function(size) { root.baseFontSize = size; hasUnsavedChanges = true }
            }

            // Section 4 + 5: Spacing and Border Radius
            ThemeSpacingRadius {
                baseSpacing: root.baseSpacing
                radiusSmall: root.radiusSmall
                radiusMedium: root.radiusMedium
                radiusLarge: root.radiusLarge
                onBaseSpacingChanged: function(val) { root.baseSpacing = val; hasUnsavedChanges = true }
                onRadiusSmallChanged: function(val) { root.radiusSmall = val; hasUnsavedChanges = true }
                onRadiusMediumChanged: function(val) { root.radiusMedium = val; hasUnsavedChanges = true }
                onRadiusLargeChanged: function(val) { root.radiusLarge = val; hasUnsavedChanges = true }
            }

            // Section 6: Live Preview
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

            // Section 7: Action Buttons
            FlexRow {
                Layout.fillWidth: true
                spacing: 12
                CButton { text: "Reset to Default"; variant: "ghost"; onClicked: resetToDefaults() }
                Item { Layout.fillWidth: true }
                CButton { text: "Apply Theme"; variant: "primary"; onClicked: applyTheme() }
            }

            // Feedback alert
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

    function resetToDefaults() {
        customPrimary = Theme.primary; customBackground = Theme.background; customSurface = Theme.surface
        customPaper = Theme.paper; customText = Theme.text; customTextSecondary = Theme.textSecondary
        customBorder = Theme.border; customError = Theme.error; customWarning = Theme.warning
        customSuccess = Theme.success; customInfo = Theme.info
        fontFamily = "Inter"; baseFontSize = 14; baseSpacing = 8
        radiusSmall = 4; radiusMedium = 8; radiusLarge = 16
        hasUnsavedChanges = false
    }

    function applyTheme() {
        hasUnsavedChanges = false
        feedbackAlert.visible = true
        feedbackTimer.restart()
    }

    Timer { id: feedbackTimer; interval: 3000; onTriggered: feedbackAlert.visible = false }
}

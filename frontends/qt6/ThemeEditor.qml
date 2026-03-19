import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

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

            // Section 1: Theme Selector Grid
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Theme Presets" }
                    CText { variant: "caption"; text: "Select a base theme to start from" }

                    GridLayout {
                        Layout.fillWidth: true
                        columns: 3
                        rowSpacing: 12
                        columnSpacing: 12

                        Repeater {
                            model: themeDefinitions

                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 90
                                radius: radiusMedium
                                color: modelData.surface
                                border.width: selectedTheme === modelData.name ? 2 : 1
                                border.color: selectedTheme === modelData.name ? Theme.primary : Theme.border

                                MouseArea {
                                    anchors.fill: parent
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: {
                                        selectedTheme = modelData.name
                                        hasUnsavedChanges = true
                                    }
                                }

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 10
                                    spacing: 8

                                    // Mini color swatch row
                                    RowLayout {
                                        spacing: 4

                                        Repeater {
                                            model: [modelData.bg, modelData.primary, modelData.text, modelData.surface]

                                            Rectangle {
                                                width: 16
                                                height: 16
                                                radius: 3
                                                color: modelData
                                                border.width: 1
                                                border.color: Qt.darker(modelData, 1.3)
                                            }
                                        }
                                    }

                                    Item { Layout.fillHeight: true }

                                    Text {
                                        text: themeDefinitions[index].label
                                        font.pixelSize: 12
                                        font.weight: selectedTheme === themeDefinitions[index].name ? Font.Bold : Font.Normal
                                        color: themeDefinitions[index].text
                                    }

                                    // Selection indicator
                                    Rectangle {
                                        width: 8
                                        height: 8
                                        radius: 4
                                        color: selectedTheme === themeDefinitions[index].name ? Theme.primary : "transparent"
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Section 2: Color Customization Panel
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12
                        CText { variant: "h4"; text: "Color Tokens" }
                        Item { Layout.fillWidth: true }
                        CChip { text: "11 tokens" }
                    }

                    CText { variant: "caption"; text: "Click any swatch to fine-tune. Values must be valid hex colors (#RRGGBB)." }

                    CDivider { Layout.fillWidth: true }

                    GridLayout {
                        Layout.fillWidth: true
                        columns: 2
                        rowSpacing: 12
                        columnSpacing: 16

                        // Primary
                        ColorField {
                            label: "Primary"
                            colorValue: customPrimary
                            onColorEdited: function(val) { customPrimary = val; hasUnsavedChanges = true }
                        }

                        // Background
                        ColorField {
                            label: "Background"
                            colorValue: customBackground
                            onColorEdited: function(val) { customBackground = val; hasUnsavedChanges = true }
                        }

                        // Surface
                        ColorField {
                            label: "Surface"
                            colorValue: customSurface
                            onColorEdited: function(val) { customSurface = val; hasUnsavedChanges = true }
                        }

                        // Paper
                        ColorField {
                            label: "Paper"
                            colorValue: customPaper
                            onColorEdited: function(val) { customPaper = val; hasUnsavedChanges = true }
                        }

                        // Text
                        ColorField {
                            label: "Text"
                            colorValue: customText
                            onColorEdited: function(val) { customText = val; hasUnsavedChanges = true }
                        }

                        // Text Secondary
                        ColorField {
                            label: "Text Secondary"
                            colorValue: customTextSecondary
                            onColorEdited: function(val) { customTextSecondary = val; hasUnsavedChanges = true }
                        }

                        // Border
                        ColorField {
                            label: "Border"
                            colorValue: customBorder
                            onColorEdited: function(val) { customBorder = val; hasUnsavedChanges = true }
                        }

                        // Error
                        ColorField {
                            label: "Error"
                            colorValue: customError
                            onColorEdited: function(val) { customError = val; hasUnsavedChanges = true }
                        }

                        // Warning
                        ColorField {
                            label: "Warning"
                            colorValue: customWarning
                            onColorEdited: function(val) { customWarning = val; hasUnsavedChanges = true }
                        }

                        // Success
                        ColorField {
                            label: "Success"
                            colorValue: customSuccess
                            onColorEdited: function(val) { customSuccess = val; hasUnsavedChanges = true }
                        }

                        // Info
                        ColorField {
                            label: "Info"
                            colorValue: customInfo
                            onColorEdited: function(val) { customInfo = val; hasUnsavedChanges = true }
                        }
                    }
                }
            }

            // Section 3: Typography
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Typography" }
                    CText { variant: "caption"; text: "Configure font family and base size for the entire interface" }

                    CDivider { Layout.fillWidth: true }

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 16

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 8

                            CTextField {
                                Layout.fillWidth: true
                                label: "Font Family"
                                placeholderText: "e.g., Inter, Roboto, system-ui"
                                text: fontFamily
                                onTextChanged: {
                                    fontFamily = text
                                    hasUnsavedChanges = true
                                }
                            }
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 8

                            CText { variant: "body2"; text: "Base Font Size: " + baseFontSize + "px" }

                            Slider {
                                Layout.fillWidth: true
                                from: 10
                                to: 24
                                stepSize: 1
                                value: baseFontSize
                                onValueChanged: {
                                    baseFontSize = value
                                    hasUnsavedChanges = true
                                }

                                background: Rectangle {
                                    x: parent.leftPadding
                                    y: parent.topPadding + parent.availableHeight / 2 - height / 2
                                    width: parent.availableWidth
                                    height: 4
                                    radius: 2
                                    color: Theme.border

                                    Rectangle {
                                        width: parent.parent.visualPosition * parent.width
                                        height: parent.height
                                        radius: 2
                                        color: Theme.primary
                                    }
                                }

                                handle: Rectangle {
                                    x: parent.leftPadding + parent.visualPosition * (parent.availableWidth - width)
                                    y: parent.topPadding + parent.availableHeight / 2 - height / 2
                                    width: 18
                                    height: 18
                                    radius: 9
                                    color: Theme.primary
                                    border.width: 2
                                    border.color: Theme.background
                                }
                            }

                            RowLayout {
                                spacing: 4
                                CText { variant: "caption"; text: "10px" }
                                Item { Layout.fillWidth: true }
                                CText { variant: "caption"; text: "24px" }
                            }
                        }
                    }
                }
            }

            // Section 4: Spacing
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Spacing" }
                    CText { variant: "caption"; text: "Base spacing unit used as a multiplier across the layout system" }

                    CDivider { Layout.fillWidth: true }

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 16

                        CTextField {
                            Layout.preferredWidth: 120
                            label: "Base Spacing (px)"
                            placeholderText: "8"
                            text: baseSpacing.toString()
                            onTextChanged: {
                                var val = parseInt(text)
                                if (!isNaN(val) && val > 0 && val <= 32) {
                                    baseSpacing = val
                                    hasUnsavedChanges = true
                                }
                            }
                        }

                        // Spacing preview
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 4

                            CText { variant: "caption"; text: "Preview: spacing scale" }

                            RowLayout {
                                spacing: 8

                                Repeater {
                                    model: [1, 2, 3, 4, 6]

                                    ColumnLayout {
                                        spacing: 4
                                        Rectangle {
                                            width: baseSpacing * modelData
                                            height: baseSpacing * modelData
                                            radius: 3
                                            color: Theme.primary
                                            opacity: 0.3 + (index * 0.15)
                                        }
                                        Text {
                                            text: (baseSpacing * modelData) + "px"
                                            font.pixelSize: 10
                                            color: Theme.textSecondary
                                            horizontalAlignment: Text.AlignHCenter
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Section 5: Border Radius
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    CText { variant: "h4"; text: "Border Radius" }
                    CText { variant: "caption"; text: "Control corner rounding for small, medium, and large elements" }

                    CDivider { Layout.fillWidth: true }

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 16

                        // Radius inputs
                        CTextField {
                            Layout.preferredWidth: 100
                            label: "Small (px)"
                            placeholderText: "4"
                            text: radiusSmall.toString()
                            onTextChanged: {
                                var val = parseInt(text)
                                if (!isNaN(val) && val >= 0) {
                                    radiusSmall = val
                                    hasUnsavedChanges = true
                                }
                            }
                        }

                        CTextField {
                            Layout.preferredWidth: 100
                            label: "Medium (px)"
                            placeholderText: "8"
                            text: radiusMedium.toString()
                            onTextChanged: {
                                var val = parseInt(text)
                                if (!isNaN(val) && val >= 0) {
                                    radiusMedium = val
                                    hasUnsavedChanges = true
                                }
                            }
                        }

                        CTextField {
                            Layout.preferredWidth: 100
                            label: "Large (px)"
                            placeholderText: "16"
                            text: radiusLarge.toString()
                            onTextChanged: {
                                var val = parseInt(text)
                                if (!isNaN(val) && val >= 0) {
                                    radiusLarge = val
                                    hasUnsavedChanges = true
                                }
                            }
                        }

                        Item { Layout.fillWidth: true }

                        // Radius preview
                        RowLayout {
                            spacing: 16

                            Repeater {
                                model: [
                                    { label: "Sm", r: radiusSmall },
                                    { label: "Md", r: radiusMedium },
                                    { label: "Lg", r: radiusLarge }
                                ]

                                ColumnLayout {
                                    spacing: 4

                                    Rectangle {
                                        width: 48
                                        height: 48
                                        radius: modelData.r
                                        color: "transparent"
                                        border.width: 2
                                        border.color: Theme.primary
                                    }

                                    Text {
                                        text: modelData.label + " (" + modelData.r + "px)"
                                        font.pixelSize: 10
                                        color: Theme.textSecondary
                                        horizontalAlignment: Text.AlignHCenter
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Section 6: Live Preview Card
            CCard {
                Layout.fillWidth: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 16

                    FlexRow {
                        Layout.fillWidth: true
                        spacing: 12
                        CText { variant: "h4"; text: "Live Preview" }
                        Item { Layout.fillWidth: true }
                        CBadge { text: "Interactive" }
                    }

                    CText { variant: "caption"; text: "A sample UI rendered with your current theme configuration" }

                    CDivider { Layout.fillWidth: true }

                    // Preview container
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 340
                        radius: radiusMedium
                        color: customBackground
                        border.width: 1
                        border.color: customBorder

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 20
                            spacing: 14

                            // Preview header bar
                            Rectangle {
                                Layout.fillWidth: true
                                Layout.preferredHeight: 44
                                radius: radiusSmall
                                color: customSurface

                                RowLayout {
                                    anchors.fill: parent
                                    anchors.leftMargin: 14
                                    anchors.rightMargin: 14
                                    spacing: 12

                                    Text {
                                        text: "MetaBuilder"
                                        font.pixelSize: baseFontSize + 2
                                        font.weight: Font.Bold
                                        font.family: fontFamily
                                        color: customText
                                    }

                                    Item { Layout.fillWidth: true }

                                    Repeater {
                                        model: ["Dashboard", "Settings", "Help"]
                                        Text {
                                            text: modelData
                                            font.pixelSize: baseFontSize - 1
                                            font.family: fontFamily
                                            color: customTextSecondary
                                        }
                                    }
                                }
                            }

                            // Preview content area
                            RowLayout {
                                Layout.fillWidth: true
                                Layout.fillHeight: true
                                spacing: 12

                                // Preview card 1
                                Rectangle {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    radius: radiusMedium
                                    color: customPaper
                                    border.width: 1
                                    border.color: customBorder

                                    ColumnLayout {
                                        anchors.fill: parent
                                        anchors.margins: 14
                                        spacing: 8

                                        Text {
                                            text: "Status"
                                            font.pixelSize: baseFontSize
                                            font.weight: Font.Bold
                                            font.family: fontFamily
                                            color: customText
                                        }

                                        Rectangle {
                                            Layout.fillWidth: true
                                            height: 1
                                            color: customBorder
                                        }

                                        // Status indicators
                                        Repeater {
                                            model: [
                                                { label: "DBAL",     col: customSuccess },
                                                { label: "Auth",     col: customSuccess },
                                                { label: "Storage",  col: customWarning }
                                            ]

                                            RowLayout {
                                                spacing: 8
                                                Rectangle {
                                                    width: 8; height: 8; radius: 4
                                                    color: modelData.col
                                                }
                                                Text {
                                                    text: modelData.label
                                                    font.pixelSize: baseFontSize - 2
                                                    font.family: fontFamily
                                                    color: customTextSecondary
                                                }
                                            }
                                        }

                                        Item { Layout.fillHeight: true }

                                        // Preview button
                                        Rectangle {
                                            Layout.fillWidth: true
                                            height: 30
                                            radius: radiusSmall
                                            color: customPrimary

                                            Text {
                                                anchors.centerIn: parent
                                                text: "View Details"
                                                font.pixelSize: baseFontSize - 2
                                                font.family: fontFamily
                                                color: "#ffffff"
                                            }
                                        }
                                    }
                                }

                                // Preview card 2
                                Rectangle {
                                    Layout.fillWidth: true
                                    Layout.fillHeight: true
                                    radius: radiusMedium
                                    color: customPaper
                                    border.width: 1
                                    border.color: customBorder

                                    ColumnLayout {
                                        anchors.fill: parent
                                        anchors.margins: 14
                                        spacing: 8

                                        Text {
                                            text: "Activity"
                                            font.pixelSize: baseFontSize
                                            font.weight: Font.Bold
                                            font.family: fontFamily
                                            color: customText
                                        }

                                        Rectangle {
                                            Layout.fillWidth: true
                                            height: 1
                                            color: customBorder
                                        }

                                        Repeater {
                                            model: [
                                                { msg: "User signed in", t: "2m ago" },
                                                { msg: "Package installed", t: "5m ago" },
                                                { msg: "Schema updated", t: "1h ago" }
                                            ]

                                            ColumnLayout {
                                                spacing: 2
                                                Text {
                                                    text: modelData.msg
                                                    font.pixelSize: baseFontSize - 2
                                                    font.family: fontFamily
                                                    color: customText
                                                }
                                                Text {
                                                    text: modelData.t
                                                    font.pixelSize: baseFontSize - 4
                                                    font.family: fontFamily
                                                    color: customTextSecondary
                                                }
                                            }
                                        }

                                        Item { Layout.fillHeight: true }

                                        // Error and info banners
                                        Rectangle {
                                            Layout.fillWidth: true
                                            height: 24
                                            radius: radiusSmall
                                            color: Qt.alpha(customError, 0.15)

                                            Text {
                                                anchors.centerIn: parent
                                                text: "1 alert"
                                                font.pixelSize: baseFontSize - 4
                                                font.family: fontFamily
                                                color: customError
                                            }
                                        }

                                        Rectangle {
                                            Layout.fillWidth: true
                                            height: 24
                                            radius: radiusSmall
                                            color: Qt.alpha(customInfo, 0.15)

                                            Text {
                                                anchors.centerIn: parent
                                                text: "3 notifications"
                                                font.pixelSize: baseFontSize - 4
                                                font.family: fontFamily
                                                color: customInfo
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Section 7: Action Buttons
            FlexRow {
                Layout.fillWidth: true
                spacing: 12

                CButton {
                    text: "Reset to Default"
                    variant: "ghost"
                    onClicked: resetToDefaults()
                }

                Item { Layout.fillWidth: true }

                CButton {
                    text: "Apply Theme"
                    variant: "primary"
                    onClicked: applyTheme()
                }
            }

            // Feedback alert
            CAlert {
                id: feedbackAlert
                Layout.fillWidth: true
                severity: "success"
                text: "Theme applied successfully"
                visible: false
            }

            // Bottom spacer
            Item { Layout.preferredHeight: 20 }
        }
    }

    // Inline color field component
    component ColorField: RowLayout {
        Layout.fillWidth: true
        spacing: 10

        property string label: ""
        property string colorValue: "#000000"
        signal colorEdited(string val)

        // Color swatch
        Rectangle {
            width: 32
            height: 32
            radius: 6
            color: colorValue
            border.width: 1
            border.color: Theme.border

            // Checkerboard background for transparency visibility
            Rectangle {
                anchors.fill: parent
                anchors.margins: 1
                radius: 5
                color: "transparent"
                border.width: 1
                border.color: Qt.darker(colorValue, 1.4)
                z: -1
            }
        }

        CTextField {
            Layout.fillWidth: true
            label: parent.label
            placeholderText: "#RRGGBB"
            text: colorValue
            onTextChanged: {
                if (/^#[0-9a-fA-F]{6}$/.test(text)) {
                    colorEdited(text)
                }
            }
        }
    }

    // Reset all custom values to current Theme defaults
    function resetToDefaults() {
        customPrimary = Theme.primary
        customBackground = Theme.background
        customSurface = Theme.surface
        customPaper = Theme.paper
        customText = Theme.text
        customTextSecondary = Theme.textSecondary
        customBorder = Theme.border
        customError = Theme.error
        customWarning = Theme.warning
        customSuccess = Theme.success
        customInfo = Theme.info
        fontFamily = "Inter"
        baseFontSize = 14
        baseSpacing = 8
        radiusSmall = 4
        radiusMedium = 8
        radiusLarge = 16
        hasUnsavedChanges = false
    }

    // Apply the current configuration
    function applyTheme() {
        hasUnsavedChanges = false
        feedbackAlert.visible = true
        feedbackTimer.restart()
    }

    Timer {
        id: feedbackTimer
        interval: 3000
        onTriggered: feedbackAlert.visible = false
    }
}

import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: colorTokens
    Layout.fillWidth: true

    property string customPrimary: "#000000"
    property string customBackground: "#000000"
    property string customSurface: "#000000"
    property string customPaper: "#000000"
    property string customText: "#000000"
    property string customTextSecondary: "#000000"
    property string customBorder: "#000000"
    property string customError: "#000000"
    property string customWarning: "#000000"
    property string customSuccess: "#000000"
    property string customInfo: "#000000"

    signal tokenColorEdited(string token, string value)

    // Inline color field component
    component ColorField: RowLayout {
        Layout.fillWidth: true
        spacing: 10

        property string label: ""
        property string colorValue: "#000000"
        signal colorEdited(string val)

        Rectangle {
            width: 32
            height: 32
            radius: 6
            color: colorValue
            border.width: 1
            border.color: Theme.border

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

            ColorField {
                label: "Primary"
                colorValue: customPrimary
                onColorEdited: function(val) { tokenColorEdited("primary", val) }
            }
            ColorField {
                label: "Background"
                colorValue: customBackground
                onColorEdited: function(val) { tokenColorEdited("background", val) }
            }
            ColorField {
                label: "Surface"
                colorValue: customSurface
                onColorEdited: function(val) { tokenColorEdited("surface", val) }
            }
            ColorField {
                label: "Paper"
                colorValue: customPaper
                onColorEdited: function(val) { tokenColorEdited("paper", val) }
            }
            ColorField {
                label: "Text"
                colorValue: customText
                onColorEdited: function(val) { tokenColorEdited("text", val) }
            }
            ColorField {
                label: "Text Secondary"
                colorValue: customTextSecondary
                onColorEdited: function(val) { tokenColorEdited("textSecondary", val) }
            }
            ColorField {
                label: "Border"
                colorValue: customBorder
                onColorEdited: function(val) { tokenColorEdited("border", val) }
            }
            ColorField {
                label: "Error"
                colorValue: customError
                onColorEdited: function(val) { tokenColorEdited("error", val) }
            }
            ColorField {
                label: "Warning"
                colorValue: customWarning
                onColorEdited: function(val) { tokenColorEdited("warning", val) }
            }
            ColorField {
                label: "Success"
                colorValue: customSuccess
                onColorEdited: function(val) { tokenColorEdited("success", val) }
            }
            ColorField {
                label: "Info"
                colorValue: customInfo
                onColorEdited: function(val) { tokenColorEdited("info", val) }
            }
        }
    }
}

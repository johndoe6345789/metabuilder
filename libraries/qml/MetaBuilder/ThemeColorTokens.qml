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

    readonly property var tokenModel: [
        { label: "Primary",
          token: "primary",
          value: customPrimary },
        { label: "Background",
          token: "background",
          value: customBackground },
        { label: "Surface",
          token: "surface",
          value: customSurface },
        { label: "Paper",
          token: "paper",
          value: customPaper },
        { label: "Text",
          token: "text",
          value: customText },
        { label: "Text Secondary",
          token: "textSecondary",
          value: customTextSecondary },
        { label: "Border",
          token: "border",
          value: customBorder },
        { label: "Error",
          token: "error",
          value: customError },
        { label: "Warning",
          token: "warning",
          value: customWarning },
        { label: "Success",
          token: "success",
          value: customSuccess },
        { label: "Info",
          token: "info",
          value: customInfo }
    ]

    ColumnLayout {
        Layout.fillWidth: true
        spacing: 16

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h4"; text: "Color Tokens" }
            Item { Layout.fillWidth: true }
            CChip { text: "11 tokens" }
        }

        CText {
            variant: "caption"
            text: "Click any swatch to fine-tune."
                + " Values must be valid hex"
                + " colors (#RRGGBB)."
        }

        CDivider { Layout.fillWidth: true }

        GridLayout {
            Layout.fillWidth: true
            columns: 2
            rowSpacing: 12
            columnSpacing: 16

            Repeater {
                model: colorTokens.tokenModel
                ThemeColorField {
                    label: modelData.label
                    colorValue: modelData.value
                    onColorEdited: function(val) {
                        colorTokens.tokenColorEdited(
                            modelData.token, val)
                    }
                }
            }
        }
    }
}

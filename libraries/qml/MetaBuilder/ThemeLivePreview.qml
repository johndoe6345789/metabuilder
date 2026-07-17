import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

CCard {
    id: livePreview
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
    property string fontFamily: "Inter"
    property int baseFontSize: 14
    property int radiusSmall: 4
    property int radiusMedium: 8

    ColumnLayout {
        Layout.fillWidth: true
        anchors.margins: 20
        spacing: 16

        FlexRow {
            Layout.fillWidth: true
            spacing: 12
            CText { variant: "h4"; text: "Live Preview" }
            Item { Layout.fillWidth: true }
            CBadge { text: "Interactive" }
        }

        CText { variant: "caption"
        text: "A sample UI rendered with your current theme configuration" }

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
                Layout.fillWidth: true
                anchors.margins: 20
                spacing: 14

                ThemePreviewForm {
                    Layout.fillWidth: true
                    customSurface: livePreview.customSurface
                    customText: livePreview.customText
                    customTextSecondary: livePreview.customTextSecondary
                    fontFamily: livePreview.fontFamily
                    baseFontSize: livePreview.baseFontSize
                    radiusSmall: livePreview.radiusSmall
                }

                ThemePreviewCard {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    customPrimary: livePreview.customPrimary
                    customPaper: livePreview.customPaper
                    customText: livePreview.customText
                    customTextSecondary: livePreview.customTextSecondary
                    customBorder: livePreview.customBorder
                    customError: livePreview.customError
                    customWarning: livePreview.customWarning
                    customSuccess: livePreview.customSuccess
                    customInfo: livePreview.customInfo
                    fontFamily: livePreview.fontFamily
                    baseFontSize: livePreview.baseFontSize
                    radiusSmall: livePreview.radiusSmall
                    radiusMedium: livePreview.radiusMedium
                }
            }
        }
    }
}

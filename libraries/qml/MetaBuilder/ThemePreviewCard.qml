import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

RowLayout {
    id: previewCards
    Layout.fillWidth: true
    Layout.fillHeight: true
    spacing: 12

    property string customPrimary: "#000000"
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

    ThemePreviewStatusCard {
        customPaper: previewCards.customPaper
        customText: previewCards.customText
        customTextSecondary: previewCards.customTextSecondary
        customBorder: previewCards.customBorder
        customPrimary: previewCards.customPrimary
        customSuccess: previewCards.customSuccess
        customWarning: previewCards.customWarning
        fontFamily: previewCards.fontFamily
        baseFontSize: previewCards.baseFontSize
        radiusSmall: previewCards.radiusSmall
        radiusMedium: previewCards.radiusMedium
    }

    ThemePreviewActivityCard {
        customPaper: previewCards.customPaper
        customText: previewCards.customText
        customTextSecondary: previewCards.customTextSecondary
        customBorder: previewCards.customBorder
        customError: previewCards.customError
        customInfo: previewCards.customInfo
        fontFamily: previewCards.fontFamily
        baseFontSize: previewCards.baseFontSize
        radiusSmall: previewCards.radiusSmall
        radiusMedium: previewCards.radiusMedium
    }
}

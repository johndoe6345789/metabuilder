import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QmlComponents 1.0

ColumnLayout {
    id: spacingRadiusRoot
    Layout.fillWidth: true
    spacing: 20

    property int baseSpacing: 8
    property int radiusSmall: 4
    property int radiusMedium: 8
    property int radiusLarge: 16

    signal baseSpacingEdited(int value)
    signal radiusSmallEdited(int value)
    signal radiusMediumEdited(int value)
    signal radiusLargeEdited(int value)

    ThemeSpacingEditor {
        Layout.fillWidth: true
        baseSpacing: spacingRadiusRoot.baseSpacing
        onBaseSpacingEdited: function(
            value) { spacingRadiusRoot.baseSpacingEdited(value) }
    }

    ThemeRadiusEditor {
        Layout.fillWidth: true
        radiusSmall: spacingRadiusRoot.radiusSmall
        radiusMedium: spacingRadiusRoot.radiusMedium
        radiusLarge: spacingRadiusRoot.radiusLarge
        onRadiusSmallEdited: function(
            value) { spacingRadiusRoot.radiusSmallEdited(value) }
        onRadiusMediumEdited: function(
            value) { spacingRadiusRoot.radiusMediumEdited(value) }
        onRadiusLargeEdited: function(
            value) { spacingRadiusRoot.radiusLargeEdited(value) }
    }
}

import QtQuick
import QmlComponents 1.0

/**
 * CText.qml - Material Design 3 typography component (desktop-scaled)
 *
 * MD3 type scale adapted for desktop density. Sizes are ~60% of mobile MD3 spec
 * to avoid bloated text on 96-144 DPI screens.
 *
 * Usage:
 *   CText { text: "Body text" }
 *   CText { variant: "h4"; text: "Heading" }
 *   CText { variant: "caption"; colorVariant: "secondary" }
 *   CText { variant: "body2"; mono: true }
 */
Text {
    id: root

    property string variant: "body1"
    // primary, secondary, disabled, error, success, warning, info, inherit
    property string colorVariant: "primary"
    property bool mono: false
    property bool truncate: false

    // Desktop-scaled MD3 type sizes
    font.pixelSize: {
        switch (variant) {
            case "h1":        return 32
            case "h2":        return 26
            case "h3":        return 22
            case "h4":        return 18
            case "h5":        return 16
            case "h6":        return 15
            case "subtitle1": return 14
            case "subtitle2": return 13
            case "body1":     return 14
            case "body2":     return 13
            case "caption":   return 11
            case "overline":  return 10
            case "button":    return 13
            default:          return 14
        }
    }

    font.weight: {
        switch (variant) {
            case "h1":        return Font.Bold
            case "h2":        return Font.Bold
            case "h3":        return Font.DemiBold
            case "h4":        return Font.DemiBold
            case "h5":        return Font.Medium
            case "h6":        return Font.Medium
            case "subtitle1": return Font.Medium
            case "subtitle2": return Font.Medium
            case "body1":     return Font.Normal
            case "body2":     return Font.Normal
            case "caption":   return Font.Normal
            case "overline":  return Font.Medium
            case "button":    return Font.Medium
            default:          return Font.Normal
        }
    }

    font.letterSpacing: {
        switch (variant) {
            case "h1":        return -0.5
            case "h2":        return -0.25
            case "overline":  return 1.2
            default:          return 0
        }
    }

    font.capitalization: variant === "overline"
        ? Font.AllUppercase : Font.MixedCase

    font.family: mono ? Theme.fontFamilyMono : Theme.fontFamily

    // Only body1 gets expanded line height
    lineHeight: variant === "body1" ? 1.4 : 1.0
    lineHeightMode: Text.ProportionalHeight

    // Default to no wrap — callers opt in with wrapMode: Text.Wrap
    wrapMode: truncate ? Text.NoWrap : Text.NoWrap

    color: {
        switch (colorVariant) {
            case "secondary": return Theme.textSecondary
            case "disabled":  return Theme.textDisabled
            case "error":     return Theme.error
            case "success":   return Theme.success
            case "warning":   return Theme.warning
            case "info":      return Theme.info
            case "inherit":   return parent ? parent.color : Theme.text
            default:          return Theme.text
        }
    }

    elide: truncate ? Text.ElideRight : Text.ElideNone
    maximumLineCount: truncate ? 1 : undefined
}

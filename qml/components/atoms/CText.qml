import QtQuick
import QmlComponents 1.0

/**
 * CText.qml - Material Design 3 typography component
 * Implements the full MD3 type scale with variant and color support
 *
 * Usage:
 *   CText { text: "Body text" }
 *   CText { variant: "h4"; text: "Heading" }
 *   CText { variant: "caption"; colorVariant: "secondary" }
 *   CText { variant: "body2"; mono: true }
 */
Text {
    id: root

    // Public properties
    property string variant: "body1"       // h1-h6, subtitle1, subtitle2, body1, body2, caption, overline, button
    property string colorVariant: "primary" // primary, secondary, disabled, error, success, warning, info, inherit
    property bool mono: false
    property bool truncate: false

    // MD3 Typography Scale
    font.pixelSize: {
        switch (variant) {
            case "h1":        return 57
            case "h2":        return 45
            case "h3":        return 36
            case "h4":        return 32
            case "h5":        return 28
            case "h6":        return 24
            case "subtitle1": return 16
            case "subtitle2": return 14
            case "body1":     return 16
            case "body2":     return 14
            case "caption":   return 12
            case "overline":  return 12
            case "button":    return 14
            default:          return 16
        }
    }

    font.weight: {
        switch (variant) {
            case "h1":        return Font.Normal
            case "h2":        return Font.Normal
            case "h3":        return Font.Normal
            case "h4":        return Font.Normal
            case "h5":        return Font.Normal
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
            case "h1":        return -0.25
            case "h2":        return 0
            case "h3":        return 0
            case "h4":        return 0
            case "h5":        return 0
            case "h6":        return 0
            case "subtitle1": return 0.15
            case "subtitle2": return 0.1
            case "body1":     return 0.5
            case "body2":     return 0.25
            case "caption":   return 0.4
            case "overline":  return 1.5
            case "button":    return 0.1
            default:          return 0
        }
    }

    font.capitalization: variant === "overline" ? Font.AllUppercase : Font.MixedCase

    font.family: mono ? Theme.fontFamilyMono : Theme.fontFamily

    lineHeight: variant === "body1" ? 1.5 : 1.0
    lineHeightMode: Text.ProportionalHeight

    // MD3 color mapping
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

    // Truncation
    elide: truncate ? Text.ElideRight : Text.ElideNone
    maximumLineCount: truncate ? 1 : undefined
    wrapMode: truncate ? Text.NoWrap : Text.WordWrap
}

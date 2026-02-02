pragma Singleton
import QtQuick

/**
 * StyleVariables.qml - CSS Custom Properties equivalent for QML
 * Mirrors React's _variables.scss with all design tokens
 */
QtObject {
    id: styleVariables

    // ============================================
    // Colors - Dark theme (default values)
    // These are base values; Theme.qml provides themed overrides
    // ============================================
    
    readonly property color colorPrimary: "#10a37f"
    readonly property color colorPrimaryDark: "#0d8a6a"
    readonly property color colorPrimaryLight: "#1abf94"
    readonly property color colorSecondary: "#8e8ea0"
    
    readonly property color colorBg: "#0d0d0d"
    readonly property color colorBgPaper: "#1a1a1a"
    readonly property color colorBgElevated: "#242424"
    readonly property color colorBgHover: Qt.rgba(255/255, 255/255, 255/255, 0.08)
    
    readonly property color colorText: "#ffffff"
    readonly property color colorTextSecondary: "#a0a0a0"
    readonly property color colorTextDisabled: "#666666"
    
    readonly property color colorBorder: "#333333"
    readonly property color colorDivider: Qt.rgba(255/255, 255/255, 255/255, 0.12)
    
    readonly property color colorSuccess: "#22c55e"
    readonly property color colorSuccessBg: Qt.rgba(34/255, 197/255, 94/255, 0.1)
    readonly property color colorWarning: "#f59e0b"
    readonly property color colorWarningBg: Qt.rgba(245/255, 158/255, 11/255, 0.1)
    readonly property color colorError: "#ef4444"
    readonly property color colorErrorBg: Qt.rgba(239/255, 68/255, 68/255, 0.1)
    readonly property color colorInfo: "#3b82f6"
    readonly property color colorInfoBg: Qt.rgba(59/255, 130/255, 246/255, 0.1)

    // ============================================
    // Spacing (matches SCSS --spacing-*)
    // ============================================
    
    readonly property int spacingXs: 4
    readonly property int spacingSm: 8
    readonly property int spacingMd: 16
    readonly property int spacingLg: 24
    readonly property int spacingXl: 32
    readonly property int spacingXxl: 48
    
    // Spacing function (like SCSS spacing function)
    function spacing(factor) {
        return spacingSm * factor
    }

    // ============================================
    // Border Radius (matches SCSS --radius-*)
    // ============================================
    
    readonly property int radiusSm: 4
    readonly property int radiusMd: 8
    readonly property int radiusLg: 12
    readonly property int radiusXl: 16
    readonly property int radiusFull: 9999

    // ============================================
    // Shadows (matches SCSS --shadow-*)
    // ============================================
    
    // Shadow values as objects for MultiEffect
    readonly property var shadowSm: ({ blur: 0.1, offset: 2, color: "#4D000000" })
    readonly property var shadowMd: ({ blur: 0.2, offset: 4, color: "#66000000" })
    readonly property var shadowLg: ({ blur: 0.3, offset: 10, color: "#80000000" })
    readonly property var shadowXl: ({ blur: 0.4, offset: 15, color: "#99000000" })

    // ============================================
    // Typography (matches SCSS --font-*)
    // ============================================
    
    readonly property string fontFamily: "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    readonly property string fontMono: "Fira Code, Consolas, Monaco, monospace"
    
    readonly property int fontSizeXs: 10  // 0.75rem = 12px, scaled to 10 for QML
    readonly property int fontSizeSm: 12  // 0.875rem = 14px, scaled
    readonly property int fontSizeMd: 14  // 1rem = 16px, scaled
    readonly property int fontSizeLg: 16  // 1.125rem = 18px, scaled
    readonly property int fontSizeXl: 18  // 1.25rem = 20px, scaled
    readonly property int fontSize2xl: 22 // 1.5rem = 24px, scaled
    
    // Font weights
    readonly property int fontWeightLight: 300
    readonly property int fontWeightRegular: 400
    readonly property int fontWeightMedium: 500
    readonly property int fontWeightSemibold: 600
    readonly property int fontWeightBold: 700

    // ============================================
    // Transitions (matches SCSS --transition-*)
    // ============================================
    
    readonly property int transitionFast: 150
    readonly property int transitionNormal: 250
    readonly property int transitionSlow: 350

    // ============================================
    // Z-Index Layers (matches SCSS --z-*)
    // ============================================
    
    readonly property int zDropdown: 100
    readonly property int zModal: 200
    readonly property int zToast: 300
    readonly property int zTooltip: 400

    // ============================================
    // Breakpoints (for responsive layouts)
    // ============================================
    
    readonly property int breakpointSm: 600
    readonly property int breakpointMd: 900
    readonly property int breakpointLg: 1200
    readonly property int breakpointXl: 1536

    // ============================================
    // Component-specific tokens
    // ============================================
    
    // Button sizes
    readonly property var buttonSizes: ({
        sm: { height: 28, paddingH: spacingSm, fontSize: fontSizeXs },
        md: { height: 36, paddingH: spacingMd, fontSize: fontSizeSm },
        lg: { height: 44, paddingH: spacingLg, fontSize: fontSizeMd }
    })
    
    // Chip sizes
    readonly property var chipSizes: ({
        sm: { height: 24, paddingH: 10, fontSize: fontSizeXs },
        md: { height: 32, paddingH: 14, fontSize: fontSizeSm }
    })
    
    // Icon button sizes
    readonly property var iconButtonSizes: ({
        sm: { size: 28 },
        md: { size: 36 },
        lg: { size: 44 }
    })

    // ============================================
    // Helper Functions
    // ============================================
    
    // Get opacity for hover states based on mode
    function hoverOpacity(isDark) {
        return isDark ? 0.08 : 0.04
    }
    
    // Get opacity for active/pressed states
    function activeOpacity(isDark) {
        return isDark ? 0.12 : 0.08
    }
    
    // Create rgba color from hex and alpha
    function rgba(hexColor, alpha) {
        return Qt.rgba(
            parseInt(hexColor.substr(1, 2), 16) / 255,
            parseInt(hexColor.substr(3, 2), 16) / 255,
            parseInt(hexColor.substr(5, 2), 16) / 255,
            alpha
        )
    }
    
    // Lighten a color
    function lighten(color, factor) {
        return Qt.lighter(color, 1 + factor)
    }
    
    // Darken a color
    function darken(color, factor) {
        return Qt.darker(color, 1 + factor)
    }
}

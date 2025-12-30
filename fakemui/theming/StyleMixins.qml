pragma Singleton
import QtQuick

/**
 * StyleMixins.qml - Reusable style mixins as JS functions
 * Mirrors React's mixins/ folder (_interactive.scss, _typography.scss, etc.)
 * 
 * Usage in QML:
 *   import "styles" as Styles
 *   Rectangle {
 *       // Apply interactive hover behavior
 *       Behavior on color { ColorAnimation { duration: Styles.Mixins.transitionFast } }
 *       color: mouseArea.containsMouse ? Styles.Mixins.hoverBg(Theme.mode) : Theme.paper
 *   }
 */
QtObject {
    id: mixins

    // Reference to variables for convenience
    readonly property int transitionFast: 150
    readonly property int transitionNormal: 250
    readonly property int transitionSlow: 350

    // ============================================
    // Interactive Mixins (from _interactive.scss)
    // ============================================
    
    /**
     * Get hover background color based on theme mode
     * @mixin hover-bg
     */
    function hoverBg(isDarkMode) {
        return isDarkMode 
            ? Qt.rgba(1, 1, 1, 0.08)  // --color-bg-hover dark
            : Qt.rgba(0, 0, 0, 0.04)   // --color-bg-hover light
    }
    
    /**
     * Get active/pressed background color
     * @mixin active-bg
     */
    function activeBg(isDarkMode) {
        return isDarkMode 
            ? Qt.rgba(1, 1, 1, 0.12)
            : Qt.rgba(0, 0, 0, 0.08)
    }
    
    /**
     * Get selected background color
     * @mixin selected-bg
     */
    function selectedBg(isDarkMode) {
        return isDarkMode 
            ? Qt.rgba(1, 1, 1, 0.16)
            : Qt.rgba(0, 0, 0, 0.12)
    }
    
    /**
     * Create focus ring style object
     * @mixin focus-ring
     */
    function focusRingStyle(primaryColor) {
        return {
            width: 2,
            color: primaryColor,
            offset: 2
        }
    }

    // ============================================
    // Typography Mixins (from _typography.scss)
    // ============================================
    
    /**
     * Get typography style object for different variants
     * @param variant: "body1" | "body2" | "caption" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2"
     */
    function typography(variant) {
        const styles = {
            h1: { size: 34, weight: Font.Light, spacing: -1.5 },
            h2: { size: 28, weight: Font.Light, spacing: -0.5 },
            h3: { size: 24, weight: Font.Normal, spacing: 0 },
            h4: { size: 20, weight: Font.Normal, spacing: 0.25 },
            h5: { size: 18, weight: Font.Normal, spacing: 0 },
            h6: { size: 16, weight: Font.Medium, spacing: 0.15 },
            subtitle1: { size: 16, weight: Font.Normal, spacing: 0.15 },
            subtitle2: { size: 14, weight: Font.Medium, spacing: 0.1 },
            body1: { size: 14, weight: Font.Normal, spacing: 0.5 },
            body2: { size: 12, weight: Font.Normal, spacing: 0.25 },
            caption: { size: 10, weight: Font.Normal, spacing: 0.4 },
            overline: { size: 10, weight: Font.Medium, spacing: 1.5 },
            button: { size: 14, weight: Font.Medium, spacing: 1.25 }
        }
        return styles[variant] || styles.body1
    }
    
    /**
     * Get monospace font family
     */
    readonly property string monoFont: "Menlo, Monaco, Consolas, 'Fira Code', monospace"
    
    /**
     * Text truncation with ellipsis - returns style object
     */
    readonly property var textTruncate: ({
        elide: Text.ElideRight,
        maximumLineCount: 1,
        wrapMode: Text.NoWrap
    })

    // ============================================
    // Flex Mixins (from _flex.scss)
    // ============================================
    
    /**
     * Flex layout presets for RowLayout/ColumnLayout
     */
    readonly property var flexCenter: ({
        alignment: Qt.AlignHCenter | Qt.AlignVCenter
    })
    
    readonly property var flexBetween: ({
        alignment: Qt.AlignVCenter
        // Use Layout.fillWidth on first item, rest will push to end
    })
    
    readonly property var flexStart: ({
        alignment: Qt.AlignLeft | Qt.AlignVCenter
    })
    
    readonly property var flexEnd: ({
        alignment: Qt.AlignRight | Qt.AlignVCenter
    })

    // ============================================
    // Card Mixins (from _card.scss)
    // ============================================
    
    /**
     * Get card style based on variant
     * @param variant: "default" | "elevated" | "outlined"
     */
    function cardStyle(variant, isDarkMode) {
        const base = {
            radius: 8,
            borderWidth: 1
        }
        
        switch (variant) {
            case "elevated":
                return Object.assign({}, base, {
                    borderWidth: 0,
                    shadow: { blur: 0.3, offset: 4, color: "#40000000" }
                })
            case "outlined":
                return Object.assign({}, base, {
                    borderColor: isDarkMode ? "#333333" : "#e0e0e0"
                })
            default:
                return Object.assign({}, base, {
                    borderColor: isDarkMode ? "#333333" : "#e0e0e0"
                })
        }
    }

    // ============================================
    // Scrollbar Mixins (from _scrollbar.scss)
    // ============================================
    
    /**
     * Scrollbar style properties
     */
    readonly property var scrollbarStyle: ({
        width: 8,
        radius: 4,
        trackColor: "transparent",
        thumbColor: Qt.rgba(1, 1, 1, 0.3),
        thumbHoverColor: Qt.rgba(1, 1, 1, 0.5)
    })

    // ============================================
    // Panel Mixins (from _panel.scss)
    // ============================================
    
    /**
     * Get panel header style
     */
    function panelHeaderStyle(primaryColor) {
        return {
            height: 40,
            backgroundColor: Qt.darker(primaryColor, 1.2),
            paddingH: 16,
            paddingV: 8
        }
    }

    // ============================================
    // Input Mixins (from _input.scss)
    // ============================================
    
    /**
     * Get input field style based on state
     */
    function inputStyle(state, isDarkMode) {
        const base = {
            height: 40,
            radius: 4,
            paddingH: 12,
            fontSize: 14
        }
        
        const borderColors = {
            default: isDarkMode ? "#333333" : "#e0e0e0",
            focused: "#10a37f",  // primary
            error: "#ef4444",
            disabled: isDarkMode ? "#1a1a1a" : "#f5f5f5"
        }
        
        return Object.assign({}, base, {
            borderColor: borderColors[state] || borderColors.default,
            borderWidth: state === "focused" ? 2 : 1
        })
    }

    // ============================================
    // Animation Presets
    // ============================================
    
    /**
     * Easing curves matching CSS ease functions
     */
    readonly property var easings: ({
        easeOut: Easing.OutCubic,
        easeIn: Easing.InCubic,
        easeInOut: Easing.InOutCubic,
        linear: Easing.Linear,
        bounce: Easing.OutBounce
    })
    
    /**
     * Create animation properties object
     */
    function animationProps(duration, easing) {
        return {
            duration: duration || transitionNormal,
            easing: easing || Easing.OutCubic
        }
    }

    // ============================================
    // Responsive Helpers
    // ============================================
    
    /**
     * Check if width is at or above breakpoint
     */
    function isBreakpoint(width, breakpoint) {
        const breakpoints = {
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536
        }
        return width >= (breakpoints[breakpoint] || 0)
    }
    
    /**
     * Get responsive value based on width
     */
    function responsive(width, values) {
        // values = { xs: val, sm: val, md: val, lg: val, xl: val }
        if (width >= 1536 && values.xl !== undefined) return values.xl
        if (width >= 1200 && values.lg !== undefined) return values.lg
        if (width >= 900 && values.md !== undefined) return values.md
        if (width >= 600 && values.sm !== undefined) return values.sm
        return values.xs !== undefined ? values.xs : values.sm
    }

    // ============================================
    // Status Color Helpers
    // ============================================
    
    /**
     * Get status color based on status string
     */
    function statusColor(status) {
        const colors = {
            success: "#22c55e",
            completed: "#22c55e",
            warning: "#f59e0b",
            pending: "#f59e0b",
            queued: "#f59e0b",
            error: "#ef4444",
            failed: "#ef4444",
            info: "#3b82f6",
            running: "#3b82f6",
            primary: "#10a37f"
        }
        return colors[status] || "#8e8ea0"
    }
    
    /**
     * Get status background color (with alpha)
     */
    function statusBgColor(status) {
        const color = statusColor(status)
        return Qt.rgba(
            parseInt(color.substr(1, 2), 16) / 255,
            parseInt(color.substr(3, 2), 16) / 255,
            parseInt(color.substr(5, 2), 16) / 255,
            0.1
        )
    }
}
